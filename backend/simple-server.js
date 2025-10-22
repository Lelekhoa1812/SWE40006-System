const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://medmsg-frontend.azurewebsites.net'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL to handle query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else if (pathname === '/api/v1/doctors') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify([
        {
          id: '1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          experience: 15,
          rating: 4.8,
          bio: 'Experienced cardiologist with expertise in interventional procedures.',
          availability: 'Monday-Friday 9AM-5PM',
        },
      ])
    );
  } else if (pathname === '/api/v1/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not authenticated' }));
  } else if (pathname === '/api/v1/auth/register') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Registration endpoint - not implemented in simple server',
      })
    );
  } else if (pathname === '/api/v1/auth/login') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Login endpoint - not implemented in simple server',
      })
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
