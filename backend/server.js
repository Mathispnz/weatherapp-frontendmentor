const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());

app.get("/api/search", async (req, res) => {
  try {
    const value = req.query.q;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur API" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});