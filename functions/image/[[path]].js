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


  // Route for serving uploaded files
  if (path.startsWith('/image/') && method === 'GET') {
    
    const filename = url.pathname.split('/image/')[1];
    try {
      const object = await env.SUMMER_PROJECT.get(filename);
      
      if (!object) {
        return new Response('File not found', { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': 'image/'+filename.split('.')[1],
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        }
      });

    } catch (error) {
      return new Response('Error retrieving image', { status: 500 });
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