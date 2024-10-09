require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
let urls = [];

app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST URL to shorten
app.post('/api/shorturl', (req, res) => {
  const { url: userUrl } = req.body;
  
  // Extract hostname to validate the URL
  const hostname = new URL(userUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    const shortUrl = urls.length + 1;
    urls.push({ original_url: userUrl, short_url: shortUrl });
    
    res.json({ original_url: userUrl, short_url: shortUrl });
  });
});

// Redirect to the original URL based on short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const urlData = urls.find(u => u.short_url == short_url);
  
  if (urlData) {
    res.redirect(urlData.original_url);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
