const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fetch = (...args) => import('node-fetch').then(({default:fn})=>fn(...args));
const fs = require('fs');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }));

function requireAuth(req, res, next){
  if (req.session && req.session.authenticated) return next();
  return res.redirect('/login');
}

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === config.username && password === config.password){
    req.session.authenticated = true;
    return res.redirect('/dashboard');
  }
  return res.render('login', { error: 'Invalid credentials' });
});
app.get('/logout', (req, res) => req.session.destroy(()=>res.redirect('/login')));
app.get('/dashboard', requireAuth, (req, res) => res.render('dashboard'));

app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const stats = await readStats();
    return res.json({ ok: true, stats });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

async function readStats(){
  if (/^https?:\/\//i.test(config.statsPath)){
    const r = await fetch(config.statsPath);
    if (!r.ok) throw new Error('Failed to fetch stats from URL: ' + r.status);
    return r.json();
  }
  const p = path.resolve(config.statsPath || './stats.json');
  if (!fs.existsSync(p)) throw new Error('stats.json not found at: ' + p);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log(`Stats panel running on port ${PORT}`));