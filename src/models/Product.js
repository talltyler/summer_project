import { query, queryFirst, execute } from '../db/connection.js';

export class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.category = data.category || '';
    this.tags = data.tags || [];
    this.user_rating = data.user_rating || 0;
    this.rating_count = data.rating_count || 0;
    this.created_by = data.created_by || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Get all products with optional filtering
  static async findAll(db, filters = {}) {
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const result = await query(db, sql, params);
    return result.results.map(row => {
      const product = new Product(row);
      if (typeof product.tags === 'string') {
        try {
          product.tags = JSON.parse(product.tags);
        } catch (e) {
          product.tags = [];
        }
      }
      return product;
    });
  }

  // Find a single product by ID
  static async findById(db, id) {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const result = await queryFirst(db, sql, [id]);
    if (!result) return null;
    
    const product = new Product(result);
    if (typeof product.tags === 'string') {
      try {
        product.tags = JSON.parse(product.tags);
      } catch (e) {
        product.tags = [];
      }
    }
    return product;
  }

  // Create a new product
  static async create(db, data) {
    const sql = `
      INSERT INTO products (name, description, category, tags, user_rating, rating_count, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';
    const params = [
      data.name,
      data.description || '',
      data.category,
      tags,
      data.user_rating || 0,
      data.rating_count || 0,
      data.created_by || null
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      return await Product.findById(db, result.meta.last_row_id);
    }
    throw new Error('Failed to create product');
  }

  // Update an existing product
  async update(db, data) {
    const sql = `
      UPDATE products 
      SET name = ?, description = ?, category = ?, tags = ?, user_rating = ?, rating_count = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : JSON.stringify(this.tags);
    const params = [
      data.name !== undefined ? data.name : this.name,
      data.description !== undefined ? data.description : this.description,
      data.category !== undefined ? data.category : this.category,
      tags,
      data.user_rating !== undefined ? data.user_rating : this.user_rating,
      data.rating_count !== undefined ? data.rating_count : this.rating_count,
      this.id
    ];

    const result = await execute(db, sql, params);
    if (result.success) {
      Object.assign(this, data);
      this.updated_at = new Date().toISOString();
      return this;
    }
    throw new Error('Failed to update product');
  }

  // Delete a product
  async delete(db) {
    const sql = 'DELETE FROM products WHERE id = ?';
    const result = await execute(db, sql, [this.id]);
    if (!result.success) {
      throw new Error('Failed to delete product');
    }
    return true;
  }
}