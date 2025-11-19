import Database from '@tauri-apps/plugin-sql'

let dbInstance: Database | null = null

export const getDb = async (): Promise<Database> => {
    if (dbInstance) return dbInstance

    dbInstance = await Database.load('sqlite:streamhub.db')
    await initTables(dbInstance)
    return dbInstance
}

const initTables = async (db: Database) => {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      url TEXT,
      username TEXT,
      password TEXT,
      server_info TEXT,
      PRIMARY KEY (url, username)
    );
  `)

    await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      parent_id TEXT
    );
  `)

    await db.execute(`
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT,
      category_id TEXT,
      stream_id TEXT,
      logo TEXT,
      epg_id TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `)

    await db.execute(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      name TEXT,
      category_id TEXT,
      stream_id TEXT,
      logo TEXT,
      rating REAL,
      added_date TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `)

    await db.execute(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      name TEXT,
      category_id TEXT,
      series_id TEXT,
      logo TEXT,
      rating REAL,
      plot TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `)
}

// Helper function to insert data in chunks
const BATCH_SIZE = 500 // SQLite has a limit on number of parameters

async function batchInsert(
    db: Database,
    table: string,
    columns: string[],
    data: any[][],
    batchSize: number = BATCH_SIZE
) {
    if (data.length === 0) return

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        const placeholders = batch
            .map(() => `(${columns.map(() => '?').join(', ')})`)
            .join(', ')
        const values = batch.flat()

        await db.execute(
            `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`,
            values
        )
    }
}

// DAO Functions

export const saveProfile = async (profile: any) => {
    const db = await getDb()
    await db.execute(
        'INSERT OR REPLACE INTO profiles (url, username, password, server_info) VALUES ($1, $2, $3, $4)',
        [
            profile.url,
            profile.username,
            profile.password,
            JSON.stringify(profile.server_info)
        ]
    )
}

export const getProfile = async () => {
    const db = await getDb()
    const result = await db.select<any[]>('SELECT * FROM profiles LIMIT 1')
    if (result.length > 0) {
        return {
            ...result[0],
            server_info: JSON.parse(result[0].server_info)
        }
    }
    return null
}

export const saveCategories = async (
    categories: any[],
    type: 'live' | 'movie' | 'series'
) => {
    if (categories.length === 0) return

    const db = await getDb()
    const data = categories.map((cat) => [
        String(cat.category_id),
        cat.category_name,
        type,
        String(cat.parent_id || '0')
    ])

    await batchInsert(
        db,
        'categories',
        ['id', 'name', 'type', 'parent_id'],
        data
    )
}

export const saveChannels = async (channels: any[]) => {
    if (channels.length === 0) return

    const db = await getDb()
    const data = channels.map((ch) => [
        String(ch.stream_id),
        ch.name,
        String(ch.category_id),
        String(ch.stream_id),
        ch.stream_icon,
        String(ch.epg_channel_id || '')
    ])

    await batchInsert(
        db,
        'channels',
        ['id', 'name', 'category_id', 'stream_id', 'logo', 'epg_id'],
        data
    )
}

export const saveMovies = async (movies: any[]) => {
    if (movies.length === 0) return

    const db = await getDb()
    const data = movies.map((mov) => [
        String(mov.stream_id),
        mov.name,
        String(mov.category_id),
        String(mov.stream_id),
        mov.stream_icon,
        mov.rating,
        mov.added
    ])

    await batchInsert(
        db,
        'movies',
        [
            'id',
            'name',
            'category_id',
            'stream_id',
            'logo',
            'rating',
            'added_date'
        ],
        data
    )
}

export const saveSeries = async (seriesList: any[]) => {
    if (seriesList.length === 0) return

    const db = await getDb()
    const data = seriesList.map((s) => [
        String(s.series_id),
        s.name,
        String(s.category_id),
        String(s.series_id),
        s.cover,
        s.rating,
        s.plot
    ])

    await batchInsert(
        db,
        'series',
        ['id', 'name', 'category_id', 'series_id', 'logo', 'rating', 'plot'],
        data
    )
}

export const getCategories = async (type: 'live' | 'movie' | 'series') => {
    const db = await getDb()
    return await db.select(
        'SELECT * FROM categories WHERE type = $1 ORDER BY name',
        [type]
    )
}

export const getChannelsByCategory = async (categoryId: string) => {
    const db = await getDb()
    return await db.select(
        'SELECT * FROM channels WHERE category_id = $1 ORDER BY name',
        [categoryId]
    )
}

export const getMoviesByCategory = async (categoryId: string) => {
    const db = await getDb()
    return await db.select(
        'SELECT * FROM movies WHERE category_id = $1 ORDER BY name',
        [categoryId]
    )
}

export const getSeriesByCategory = async (categoryId: string) => {
    const db = await getDb()
    return await db.select(
        'SELECT * FROM series WHERE category_id = $1 ORDER BY name',
        [categoryId]
    )
}
