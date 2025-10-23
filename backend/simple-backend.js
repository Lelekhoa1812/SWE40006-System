const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
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

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else if (path === '/api/v1/doctors') {
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
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          specialty: 'Neurology',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0124',
          experience: 12,
          rating: 4.9,
          bio: 'Specialized in neurological disorders and treatment.',
          availability: 'Tuesday-Thursday 8AM-4PM',
        },
      ])
    );
  } else if (path === '/api/v1/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: null }));
  } else if (path === '/api/v1/auth/register') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Registration endpoint - not implemented yet' })
    );
  } else if (path === '/api/v1/auth/login') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Login endpoint - not implemented yet' })
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Simple backend server running on port ${PORT}`);
});
