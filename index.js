require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const shortUniqueId = require('short-unique-id')

const uid = new shortUniqueId({ length: 10 })
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000

// In-memory storage (replace with database for persistence)
let urlMap = {}

app.use(cors())

app.use('/public', express.static(`${process.cwd()}/public`))

app.use(bodyParser.urlencoded({ extended: "false" }))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

//  post URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url

  try{
    const hostname = new URL(originalUrl).hostname

    dns.lookup(hostname, (err) => {
      if (err) {
        res.json({'error': 'invalid url'})
      }
    });

  } catch (error) {
    res.json({'error': 'invalid url'})
  }
  
  const shortUrl = uid.rnd()
  urlMap[shortUrl] = originalUrl

  res.json({ 
    original_url: originalUrl,
    short_url: shortUrl
  })
})

app.get('/api/shorturl/:short_url', function(req, res) {
  const { short_url } = req.params
  const originalUrl = urlMap[short_url];

  if (!originalUrl) {
    res.status(404).json({ error: 'Invalid short URL' });
  }

  res.redirect(originalUrl)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
})
