require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { getDb, query, queryOne } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Template engine
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    json: (ctx) => JSON.stringify(ctx),
    groupBy: (arr, key) => {
      const groups = {};
      arr.forEach(item => {
        const k = item[key];
        if (!groups[k]) groups[k] = [];
        groups[k].push(item);
      });
      return Object.entries(groups).map(([name, items]) => ({ name, items }));
    },
    eq: (a, b) => a === b,
    range: (n) => Array.from({ length: n }, (_, i) => i),
    split: (str, sep) => str ? str.split(sep) : [],
    truncate: (str, len) => str && str.length > len ? str.slice(0, len) + '…' : str,
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/gallery', express.static(path.join(__dirname, 'gallery'))); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
  await getDb();
  const profile = queryOne('SELECT * FROM profile WHERE id = 1');
  const skills = query('SELECT * FROM skills ORDER BY category, level DESC');
  const projects = query('SELECT * FROM projects WHERE featured = 1 ORDER BY year DESC');
  const experience = query('SELECT * FROM experience ORDER BY sort_order');

  // Group skills by category
  const skillGroups = {};
  skills.forEach(s => {
    if (!skillGroups[s.category]) skillGroups[s.category] = [];
    skillGroups[s.category].push(s);
  });

  res.render('home', { profile, skillGroups, projects, experience, title: profile?.name || 'Portfolio' });
});

app.get('/projects', async (req, res) => {
  await getDb();
  const profile = queryOne('SELECT * FROM profile WHERE id = 1');
  const projects = query('SELECT * FROM projects ORDER BY featured DESC, year DESC');
  res.render('projects', { profile, projects, title: 'Projects' });
});

app.get('/contact', async (req, res) => {
  await getDb();
  const profile = queryOne('SELECT * FROM profile WHERE id = 1');
  res.render('contact', { profile, title: 'Contact' });
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  // In production, integrate with a mail service
  console.log('Contact form submission:', { name, email, message });
  res.json({ success: true, message: 'Thank you! I will get back to you soon.' });
});

// Admin routes (basic)
app.get('/admin', async (req, res) => {
  await getDb();
  const projects = query('SELECT * FROM projects ORDER BY year DESC');
  res.render('admin', { projects, title: 'Admin' });
});

app.post('/admin/projects', async (req, res) => {
  const { getDb: gDb, saveDb } = require('./db/database');
  await gDb();
  const { title, description, tech_stack, github_url, live_url, featured, year } = req.body;
  const db = await gDb();
  db.run(
    'INSERT INTO projects (title, description, tech_stack, github_url, live_url, featured, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, tech_stack, github_url || null, live_url || null, featured ? 1 : 0, year || new Date().getFullYear()]
  );
  saveDb();
  res.redirect('/admin');
});

app.delete('/admin/projects/:id', async (req, res) => {
  const { getDb: gDb, saveDb } = require('./db/database');
  const db = await gDb();
  db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio running at http://localhost:${PORT}\n`);
  });
}

start().catch(console.error);
