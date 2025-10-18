// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the out directory
app.use(express.static(path.join(__dirname, 'out')));

// Handle client-side routing - serve index.html for all routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
