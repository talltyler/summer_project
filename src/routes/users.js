import { User } from '../models/User.js';
import {Session} from '../models/Session.js';
import { getDatabase } from '../db/connection.js';
import bcrypt from "bcryptjs";

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

      // Use async/await with bcrypt
      const hash = await new Promise((resolve, reject) => {
        bcrypt.hash(data.password, 10, (err, hash) => {
          if (err) reject(err);
          else resolve(hash);
        });
      });

      // Create user
      const user = await User.create(db, {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        password_hash: hash,
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

  async login(request, env) {
    try {
      const data = await request.json();
      // Basic validation
      if (!data.username || !data.password) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Username and password are required',
          headers: {

          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }


      const db = getDatabase(env);
      const user = await User.findByUsername(db, data.username);
      console.log(user);
      const result = await new Promise((resolve, reject) => {
        bcrypt.compare(data.password, user.password_hash, (err, result) => {
          if (err || !result) reject();
          else resolve(true);
        });
      });
      if (result) {
        const cookieId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        // const cookieId = await new Promise((resolve, reject) => {
        //   bcrypt.hash(user.id, 10, (err, hash) => {
        //     if (err) reject(err);
        //     else resolve(hash);
        //   });
        // });

        await Session.create(db, {
          token: cookieId,
          data: {
            user_id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
          }
        });

        return new Response(JSON.stringify({
          success: true,
          data: user,
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json', 
            'Set-Cookie': [
              `token=${cookieId}; Path=/; HttpOnly; Secure; SameSite=Strict`
            ]
           }
        });

      } else {
        return new Response(JSON.stringify({
          success: false,
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    

    // Store hash in your password DB.


  } catch(error) {
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
  async delete (request, env, id) {
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