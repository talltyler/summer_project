import { query, queryFirst, execute } from '../db/connection.js';

export class Session {
  constructor(data = {}) {
    this.token = data.token || null;
    this.data = JSON.parse(data.data || '');
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Find a single session by token
  static async findByToken(db, token) {
    const sql = 'SELECT * FROM sessions WHERE token = ?';
    const result = await queryFirst(db, sql, [token]);
    console.log(result)
    if (!result) return null;
    
    const session = new Session(result);
    return session;
  }

  // Create a new session
  static async create(db, data) {
    const sql = `
      INSERT INTO sessions (token, data, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    const params = [
      data.token,
      JSON.stringify(data.data)
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      return await Session.findByToken(db, result.meta.last_row_id);
    }
    throw new Error('Failed to create session');
  }

  // Update an existing session
  async update(db, data) {
    const sql = `
      UPDATE sessions 
      SET data = ?, updated_at = datetime('now')
      WHERE token = ?
    `;
    
    const params = [
      data.data !== undefined ? JSON.stringify(data.data) : this.data,
      this.token
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      Object.assign(this, data);
      this.updated_at = new Date().toISOString();
      return this;
    }
    throw new Error('Failed to update session');
  }

  // Delete a session
  async delete(db) {
    const sql = 'DELETE FROM sessions WHERE token = ?';
    const result = await execute(db, sql, [this.token]);
    if (!result.success) {
      throw new Error('Failed to delete session');
    }
    return true;
  }
}