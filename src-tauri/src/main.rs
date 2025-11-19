// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    body::Body,
    extract::Query,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use reqwest::Client;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use tokio::net::TcpListener;
use futures_util::StreamExt;

#[derive(Deserialize)]
struct ProxyParams {
    url: String,
}

struct AppState {
    proxy_port: u16,
}

#[tauri::command]
fn get_proxy_port(state: State<'_, Arc<Mutex<AppState>>>) -> u16 {
    state.lock().unwrap().proxy_port
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

async fn proxy_handler(
    Query(params): Query<ProxyParams>,
    headers: HeaderMap,
) -> Response {
    let client = Client::new();
    let url = params.url;

    let mut req_builder = client.get(&url);
    
    // Forward specific headers
    for (key, value) in headers.iter() {
        let key_str = key.as_str();
        if key_str.eq_ignore_ascii_case("range") 
           || key_str.eq_ignore_ascii_case("user-agent") 
           || key_str.eq_ignore_ascii_case("accept") {
             req_builder = req_builder.header(key, value);
        }
    }

    match req_builder.send().await {
        Ok(resp) => {
            let status = resp.status();
            let mut builder = Response::builder().status(status);
            
            for (key, value) in resp.headers().iter() {
                 let key_str = key.as_str();
                 if key_str.eq_ignore_ascii_case("content-type") 
                    || key_str.eq_ignore_ascii_case("content-length") 
                    || key_str.eq_ignore_ascii_case("content-range") 
                    || key_str.eq_ignore_ascii_case("accept-ranges") {
                     builder = builder.header(key, value);
                 }
            }
            
            builder = builder.header("Access-Control-Allow-Origin", "*");

            // Convert reqwest stream to axum body
            let stream = resp.bytes_stream().map(|result| {
                result
                    .map(|bytes| axum::body::Bytes::from(bytes))
                    .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
            });
            
            let body = Body::from_stream(stream);
            builder.body(body).unwrap()
        }
        Err(_) => {
             Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::empty())
                .unwrap()
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let (tx, rx) = std::sync::mpsc::channel();
            
            tauri::async_runtime::spawn(async move {
                let app = Router::new().route("/proxy", get(proxy_handler));
                let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
                let port = listener.local_addr().unwrap().port();
                tx.send(port).unwrap();
                axum::serve(listener, app).await.unwrap();
            });

            let port = rx.recv().unwrap();
            app.manage(Arc::new(Mutex::new(AppState { proxy_port: port })));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_proxy_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
