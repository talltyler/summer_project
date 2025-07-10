import { Product } from '../models/Product.js';
import { getDatabase } from '../db/connection.js';

export const productRoutes = {
  // GET /api/products - List all products with optional filtering
  async list(request, env) {
    try {
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const sortBy = url.searchParams.get('sortBy') || 'created_at';
      const sortOrder = url.searchParams.get('sortOrder') || 'desc';
      
      const db = getDatabase(env);
      const filters = {
        category,
        search,
        sortBy,
        sortOrder
      };
      
      const products = await Product.findAll(db, filters);
      
      return new Response(JSON.stringify({
        success: true,
        data: products,
        count: products.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // POST /api/products - Create new product
  async create(request, env) {
    try {
      const data = await request.json();
      
      // Basic validation
      if (!data.name || !data.category) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Name and category are required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const db = getDatabase(env);
      
      // Create product
      const product = await Product.create(db, {
        name: data.name,
        description: data.description || '',
        category: data.category,
        tags: data.tags || [],
        user_rating: 0,
        rating_count: 0,
        created_by: data.created_by || null
      });
      
      return new Response(JSON.stringify({
        success: true,
        data: product
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // GET /api/products/:id - Get single product
  async get(request, env, id) {
    try {
      const db = getDatabase(env);
      const product = await Product.findById(db, id);
      
      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Product not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: product
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // PUT /api/products/:id - Update product
  async update(request, env, id) {
    try {
      const data = await request.json();
      const db = getDatabase(env);
      const product = await Product.findById(db, id);
      
      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Product not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Update product
      await product.update(db, data);
      
      return new Response(JSON.stringify({
        success: true,
        data: product
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // DELETE /api/products/:id - Delete product
  async delete(request, env, id) {
    try {
      const db = getDatabase(env);
      const product = await Product.findById(db, id);
      
      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Product not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      await product.delete(db);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Product deleted successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};