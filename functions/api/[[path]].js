import { productRoutes } from '../../src/routes/products.js';
import { userRoutes } from '../../src/routes/users.js';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  // Parse URL and method
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Health check endpoint
  if (path === '/api/health') {
    return new Response(JSON.stringify({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Route products API
  if (path.startsWith('/api/products')) {
    const segments = path.split('/');
    const id = segments[3]; // /api/products/:id
    
    try {
      let response;
      
      if (method === 'GET' && !id) {
        response = await productRoutes.list(request, env);
      } else if (method === 'POST' && !id) {
        response = await productRoutes.create(request, env);
      } else if (method === 'GET' && id) {
        response = await productRoutes.get(request, env, id);
      } else if (method === 'PUT' && id) {
        response = await productRoutes.update(request, env, id);
      } else if (method === 'DELETE' && id) {
        response = await productRoutes.delete(request, env, id);
      } else {
        response = new Response(JSON.stringify({
          success: false,
          error: 'Route not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Add CORS headers to response
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        headers
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }

  // Route users API
  if (path.startsWith('/api/users')) {
    const segments = path.split('/');
    const id = segments[3]; // /api/users/:id
    
    try {
      let response;
      
      if (method === 'GET' && !id) {
        response = await userRoutes.list(request, env);
      } else if (method === 'POST' && path.startsWith("/api/users/login")) {
        response = await userRoutes.login(request, env);
      } else if (method === 'POST' && !id) {
        response = await userRoutes.create(request, env);
      } else if (method === 'GET' && id) {
        response = await userRoutes.get(request, env, id);
      } else if (method === 'PUT' && id) {
        response = await userRoutes.update(request, env, id);
      } else if (method === 'DELETE' && id) {
        response = await userRoutes.delete(request, env, id);
      } else {
        response = new Response(JSON.stringify({
          success: false,
          error: 'Route not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Add CORS headers to response
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        headers
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
  
  // Default 404
  return new Response(JSON.stringify({
    success: false,
    error: 'API endpoint not found'
  }), {
    status: 404,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}