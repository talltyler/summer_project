import { query, queryFirst, execute } from '../db/connection.js';

export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.first_name = data.first_name || '';
    this.last_name = data.last_name || '';
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

  // Get all users with optional filtering
  static async findAll(db, filters = {}) {
    let sql = 'SELECT * FROM users';
    const params = [];
    const conditions = [];

    if (filters.first_name) {
      conditions.push('first_name LIKE ?');
      params.push(`%${filters.first_name}%`);
    }

    if (filters.last_name) {
      conditions.push('last_name LIKE ?');
      params.push(`%${filters.last_name}%`);
    }

    if (filters.username) {
      conditions.push('username LIKE ?');
      params.push(`%${filters.username}%`);
    }

    if (filters.email) {
      conditions.push('email LIKE ?');
      params.push(`%${filters.email}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(db, sql, params);
    return result.results.map(row => new User(row));
  }

  // Create a new user
  static async create(db, data) {
    const sql = `
      INSERT INTO users (username, first_name, last_name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const params = [
      data.username,
      data.first_name,
      data.last_name,
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

  // Update an existing user
  async update(db, data) {
    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, username = ?, email = ?, password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    const params = [
      data.first_name !== undefined ? data.first_name : this.first_name,
      data.last_name !== undefined ? data.last_name : this.last_name,
      data.username !== undefined ? data.username : this.username,
      data.email !== undefined ? data.email : this.email,
      data.password_hash !== undefined ? data.password_hash : this.password_hash,
      this.id
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      Object.assign(this, data);
      this.updated_at = new Date().toISOString();
      return this;
    }
    throw new Error('Failed to update user');
  }

  // Delete a user
  async delete(db) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await execute(db, sql, [this.id]);
    if (!result.success) {
      throw new Error('Failed to delete user');
    }
    return true;
  }

  // Return user data without password
  toJSON() {
    const { password_hash, ...userData } = this;
    return userData;
  }
}