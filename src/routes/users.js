import { User } from '../models/User.js';
import { getDatabase } from '../db/connection.js';

export const userRoutes = {
  // GET /api/users - List all users with optional filtering
  async list(request, env) {
    try {
      const url = new URL(request.url);
      const first_name = url.searchParams.get('first_name');
      const last_name = url.searchParams.get('last_name');
      const username = url.searchParams.get('username');
      const email = url.searchParams.get('email');
      

      const db = getDatabase(env);
      const filters = {
        first_name,
        last_name,
        username,
        email
      };
      
      const users = await User.findAll(db, filters);
      
      return new Response(JSON.stringify({
        success: true,
        data: users,
        count: users.length
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

  // POST /api/users - Create new user
  async create(request, env) {
    try {
      const data = await request.json();
      
      // Basic validation
      if (!data.username || !data.email) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Username and email are required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const db = getDatabase(env);
      
      // Create user
      const user = await User.create(db, {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        password_hash: data.password_hash,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
      
      return new Response(JSON.stringify({
        success: true,
        data: user
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

  // GET /api/users/:id - Get single user
  async get(request, env, id) {
    try {
      const db = getDatabase(env);
      const user = await User.findById(db, id);
      
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: user
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

  // PUT /api/user/:id - Update user
  async update(request, env, id) {
    try {
      const data = await request.json();
      const db = getDatabase(env);
      const user = await User.findById(db, id);
      
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Update user
      await user.update(db, data);
      
      return new Response(JSON.stringify({
        success: true,
        data: user
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

  // DELETE /api/user/:id - Delete user
  async delete(request, env, id) {
    try {
      const db = getDatabase(env);
      const user = await User.findById(db, id);
      
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      await user.delete(db);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'User deleted successfully'
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