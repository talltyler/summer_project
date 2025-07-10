import { query, queryFirst, execute } from '../db/connection.js';

export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.password_hash = data.password_hash || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Find user by ID
  static async findById(db, id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const result = await queryFirst(db, sql, [id]);
    return result ? new User(result) : null;
  }

  // Find user by username
  static async findByUsername(db, username) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const result = await queryFirst(db, sql, [username]);
    return result ? new User(result) : null;
  }

  // Find user by email
  static async findByEmail(db, email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const result = await queryFirst(db, sql, [email]);
    return result ? new User(result) : null;
  }

  // Create a new user
  static async create(db, data) {
    const sql = `
      INSERT INTO users (username, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const params = [
      data.username,
      data.email,
      data.password_hash
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      return await User.findById(db, result.meta.last_row_id);
    }
    throw new Error('Failed to create user');
  }

  // Get user's products
  async getProducts(db) {
    const sql = 'SELECT * FROM products WHERE created_by = ? ORDER BY created_at DESC';
    const result = await query(db, sql, [this.id]);
    return result.results || [];
  }

  // Return user data without password
  toJSON() {
    const { password_hash, ...userData } = this;
    return userData;
  }
}