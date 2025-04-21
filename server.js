const express = require('express');
const path = require('path');
const app = express();

// Serve static files from current directory
app.use(express.static(__dirname));

// Handle all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
