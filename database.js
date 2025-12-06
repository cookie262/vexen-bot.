const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { databasePath } = require('./config');

class VexenDatabase {
  constructor() {
    this.db = new sqlite3.Database(path.resolve(databasePath));
    this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Users table: id, xp, level, warns, join_date
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            warns INTEGER DEFAULT 0,
            join_date TEXT
          )
        `);

        // Warns table: id, user_id, reason, warned_by, timestamp
        this.db.run(`
          CREATE TABLE IF NOT EXISTS warns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            reason TEXT,
            warned_by TEXT,
            timestamp TEXT
          )
        `);

        // Bans table: id, user_id, reason, banned_by, timestamp, duration
        this.db.run(`
          CREATE TABLE IF NOT EXISTS bans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            reason TEXT,
            banned_by TEXT,
            timestamp TEXT,
            duration INTEGER
          )
        `);

        // Timeouts table: id, user_id, reason, timed_out_by, timestamp, duration
        this.db.run(`
          CREATE TABLE IF NOT EXISTS timeouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            reason TEXT,
            timed_out_by TEXT,
            timestamp TEXT,
            duration INTEGER
          )
        `);

        // Guilds table: id, log_channel_id, warn_channel_id, ban_channel_id, blacklist_channel_id, timeout_channel_id, level_channel_id
        this.db.run(`
          CREATE TABLE IF NOT EXISTS guilds (
            id TEXT PRIMARY KEY,
            log_channel_id TEXT,
            warn_channel_id TEXT,
            ban_channel_id TEXT,
            blacklist_channel_id TEXT,
            timeout_channel_id TEXT,
            level_channel_id TEXT
          )
        `);

        // Blacklisted users table: id
        this.db.run(`
          CREATE TABLE IF NOT EXISTS blacklisted_users (
            id TEXT PRIMARY KEY
          )
        `);

        // Harmony table: id, user_id, harmony_points, last_harmonized
        this.db.run(`
          CREATE TABLE IF NOT EXISTS harmony (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            harmony_points INTEGER DEFAULT 0,
            last_harmonized TEXT
          )
        `);

        // Leaders table: id, user_id, guild_id
        this.db.run(`
          CREATE TABLE IF NOT EXISTS leaders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            guild_id TEXT,
            UNIQUE(user_id, guild_id)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // User methods
  getUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  addUser(userId, joinDate) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR IGNORE INTO users (id, join_date) VALUES (?, ?)', [userId, joinDate], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  updateUserXp(userId, xp) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE users SET xp = xp + ? WHERE id = ?', [xp, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  updateUserLevel(userId, level) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE users SET level = ? WHERE id = ?', [level, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  addWarn(userId, reason, warnedBy) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      this.db.run('INSERT INTO warns (user_id, reason, warned_by, timestamp) VALUES (?, ?, ?, ?)', [userId, reason, warnedBy, timestamp], function(err) {
        if (err) reject(err);
        else {
          this.db.run('UPDATE users SET warns = warns + 1 WHERE id = ?', [userId], function(err2) {
            if (err2) reject(err2);
            else resolve();
          });
        }
      });
    });
  }

  getWarns(userId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM warns WHERE user_id = ? ORDER BY timestamp DESC', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  removeWarn(warnId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM warns WHERE id = ?', [warnId], function(err) {
        if (err) reject(err);
        else {
          // Update user warns count
          this.db.run('UPDATE users SET warns = (SELECT COUNT(*) FROM warns WHERE user_id = (SELECT user_id FROM warns WHERE id = ?)) WHERE id = (SELECT user_id FROM warns WHERE id = ?)', [warnId, warnId], function(err2) {
            if (err2) reject(err2);
            else resolve();
          });
        }
      });
    });
  }

  // Ban methods
  addBan(userId, reason, bannedBy, duration = null) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      this.db.run('INSERT INTO bans (user_id, reason, banned_by, timestamp, duration) VALUES (?, ?, ?, ?, ?)', [userId, reason, bannedBy, timestamp, duration], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getBans(userId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM bans WHERE user_id = ? ORDER BY timestamp DESC', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Timeout methods
  addTimeout(userId, reason, timedOutBy, duration) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      this.db.run('INSERT INTO timeouts (user_id, reason, timed_out_by, timestamp, duration) VALUES (?, ?, ?, ?, ?)', [userId, reason, timedOutBy, timestamp, duration], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getTimeouts(userId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM timeouts WHERE user_id = ? ORDER BY timestamp DESC', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Guild methods
  getGuild(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM guilds WHERE id = ?', [guildId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  addGuild(guildId) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR IGNORE INTO guilds (id) VALUES (?)', [guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  setGuildChannel(guildId, channelType, channelId) {
    return new Promise((resolve, reject) => {
      const column = `${channelType}_channel_id`;
      this.db.run(`UPDATE guilds SET ${column} = ? WHERE id = ?`, [channelId, guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Blacklist methods
  isBlacklisted(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM blacklisted_users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row !== undefined);
      });
    });
  }

  blacklistUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR IGNORE INTO blacklisted_users (id) VALUES (?)', [userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  unblacklistUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM blacklisted_users WHERE id = ?', [userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Harmony methods
  getHarmony(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM harmony WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || { harmony_points: 0, last_harmonized: null });
      });
    });
  }

  addHarmony(userId, points, fromUserId) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      this.db.run('INSERT OR REPLACE INTO harmony (user_id, harmony_points, last_harmonized) VALUES (?, COALESCE((SELECT harmony_points FROM harmony WHERE user_id = ?) + ?, ?), ?)', [userId, userId, points, points, timestamp], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Server management methods
  isServerAllowed(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM allowed_servers WHERE id = ?', [guildId], (err, row) => {
        if (err) reject(err);
        else resolve(row !== undefined);
      });
    });
  }

  addAllowedServer(guildId) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR IGNORE INTO allowed_servers (id) VALUES (?)', [guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  removeAllowedServer(guildId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM allowed_servers WHERE id = ?', [guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getAllowedServers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT id FROM allowed_servers', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Leader methods
  isLeader(userId, guildId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM leaders WHERE user_id = ? AND guild_id = ?', [userId, guildId], (err, row) => {
        if (err) reject(err);
        else resolve(row !== undefined);
      });
    });
  }

  addLeader(userId, guildId) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR IGNORE INTO leaders (user_id, guild_id) VALUES (?, ?)', [userId, guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  removeLeader(userId, guildId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM leaders WHERE user_id = ? AND guild_id = ?', [userId, guildId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getLeaders(guildId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT user_id FROM leaders WHERE guild_id = ?', [guildId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = VexenDatabase;
