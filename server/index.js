const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const charactersRouter = require('./routes/characters');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/characters', charactersRouter);

if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
