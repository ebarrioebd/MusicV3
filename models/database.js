// models/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../database.db');
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.db.run("PRAGMA busy_timeout = 5000");
                    this.db.run("PRAGMA journal_mode = WAL");
                    this.db.serialize(() => {
                        this.initTables()
                            .then(resolve)
                            .catch(reject);
                    });
                    console.log("Conectado a la base de datos:", this.dbPath)
                }
            });
        });
    }

    initTables() {
        return new Promise((resolve, reject) => {
            const sql1 = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                edad INTEGER,
                alias TEXT,
                blur TEXT,
                color_fondo TEXT,
                imagen_fondo TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `;

            const sql2 = `
            CREATE TABLE IF NOT EXISTS musicas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                url TEXT NOT NULL,
                email_user TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `;
            const sql3 = `
                CREATE TABLE IF NOT EXISTS imagenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT,
                url TEXT NOT NULL,
                email_user TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `;
            this.db.serialize(() => {
                this.db.run(sql1, (err) => {
                    if (err) return reject(err);
                    this.db.run(sql2, (err) => {
                        if (err) return reject(err);
                        this.db.run(sql3, (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            });
        });
    }

    /**
                    CREATE TABLE IF NOT EXISTS usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nombre TEXT NOT NULL,
                        url TEXT UNIQUE NOT NULL,
                        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
                    ); */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) =>
                err ? reject(err) : resolve(row)
            );
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) =>
                err ? reject(err) : resolve(rows)
            );
        });
    }
}

module.exports = new Database();
