const express = require('express');
const app = express();
const PORT = 3030;

// Store clients using a map for easy access
const clients = new Map();

// Middleware to serve the client HTML page
app.get('/client1', (req, res) => {
  res.sendFile(__dirname + '/page/client1.html');
});

app.get('/client2', (req, res) => {
  res.sendFile(__dirname + '/page/client2.html');
});

// Endpoint to register a new client
app.get('/events', (req, res) => {
  const clientId = req.query.id;

  if (!clientId) {
    return res.status(400).send('Client ID is required');
  }

  // Set headers to keep the connection open
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send a message to confirm connection
  res.write('data: Connected\n\n');

  // Add client to the clients map
  clients.set(clientId, res);

  // Remove client on connection close
  req.on('close', () => {
    clients.delete(clientId);
  });
});

// Endpoint to send a message to a specific client
app.post('/send', express.json(), (req, res) => {
  const { clientId, message } = req.body;

  const client = clients.get(clientId);

  if (client) {
    client.write(`data: ${message}\n\n`);
    res.status(200).send('Message sent');
  } else {
    res.status(404).send('Client not connected');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
