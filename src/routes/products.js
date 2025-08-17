import { Product } from '../models/Product.js';
import { getDatabase } from '../db/connection.js';
import { Session } from '../models/Session.js';

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
      const formData = await request.formData();
      
      const name = formData.get('name');
      const category = formData.get('category');
      const description = formData.get('description') || '';
      const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [];
      const image = formData.get('image');

      const cookies = request.headers.get('Cookie').split(';');
      const token = cookies[cookies.length - 1].trim().split('=')[1];
      
      // Basic validation
      if (!name || !category) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Name and category are required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const db = getDatabase(env);
      
      const session = await Session.findByToken(db, token);
      
      if (session?.data?.user_id === undefined) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User not authenticated'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      let image_url = null;
      if (
        image && (image instanceof File) && // if we have a file
        image.type.startsWith('image/') && // if it's an image
        image.size <= 5 * 1024 * 1024 // if it's less than 5MB 
      ) {
        // Generate a unique filename
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 0xFFFFFF).toString(16)}.${image.type.split('/')[1]}`;
        
        // Upload to R2 bucket
        await env.SUMMER_PROJECT.put(fileName, image.stream(), {
          httpMetadata: {
            contentType: image.type,
          },
        });
        image_url = `/image/${fileName}`;
      }
      console.log('image_url', image_url);
      // Create product
      const product = await Product.create(db, {
        name,
        description,
        category,
        tags,
        image_url,
        user_rating: 0,
        rating_count: 0,
        created_by: session.data.user_id,
      });
      
      // redirect back to home page
      const url = new URL(request.url);
      return Response.redirect(`${url.protocol}//${url.host}/`, 302);
      
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