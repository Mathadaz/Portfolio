const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    initSchema();
    seedData();
    saveDb();
  }

  return db;
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      email TEXT,
      github TEXT,
      linkedin TEXT,
      location TEXT,
      phone TEXT,
      avatar_initials TEXT
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 80
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      github_url TEXT,
      live_url TEXT,
      featured INTEGER DEFAULT 0,
      year INTEGER
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);
}

function seedData() {
  db.run(`INSERT INTO profile VALUES (
    1,
    'Zwivhuya Mathada',
    'Full-Stack Developer',
    'Recent ICT Application Development graduate from Cape Peninsula University of Technology, with hands-on industry experience at Code7Solutions. I build and deploy web and mobile applications, develop RESTful APIs, and implement secure database systems. Passionate about crafting scalable, real-world software using modern JavaScript frameworks and cloud technologies.',
    'zwivhuyamathada7@gmail.com',
    'https://github.com/Mathadaz/Portfolio',
    'https://www.linkedin.com/in/zwivhuya-mathada-428997233/',
    'Thohoyandou, Limpopo, ZA',
    '0660066345',
    'ZM'
  )`);

  const skills = [
    // Frontend
    ['Frontend', 'React.js', 88],
    ['Frontend', 'React Native', 82],
    ['Frontend', 'TypeScript', 80],
    ['Frontend', 'JavaScript', 90],
    ['Frontend', 'HTML & CSS', 92],
    ['Frontend', 'Tailwind CSS', 78],
    ['Frontend', 'Vue.js', 72],
    ['Frontend', 'Vite', 75],
    // Backend
    ['Backend', 'Node.js', 88],
    ['Backend', 'Express.js', 85],
    ['Backend', 'Spring Boot', 78],
    ['Backend', 'Django', 72],
    ['Backend', 'FastAPI', 70],
    ['Backend', 'RESTful APIs', 90],
    ['Backend', 'JWT Auth', 85],
    // Database
    ['Database', 'PostgreSQL', 85],
    ['Database', 'MySQL', 80],
    ['Database', 'SQLite', 82],
    ['Database', 'Firebase', 75],
    ['Database', 'Data Modeling', 78],
    // Cloud & Tools
    ['Cloud & Tools', 'Microsoft Azure', 78],
    ['Cloud & Tools', 'Git & GitHub', 88],
    ['Cloud & Tools', 'Postman', 85],
    ['Cloud & Tools', 'PowerBI', 70],
    ['Cloud & Tools', 'Python', 80],
    ['Cloud & Tools', 'Java', 78],
    ['Cloud & Tools', 'C# / .NET', 68],
  ];

  const skillStmt = db.prepare('INSERT INTO skills (category, name, level) VALUES (?, ?, ?)');
  skills.forEach(([cat, name, lvl]) => skillStmt.run([cat, name, lvl]));
  skillStmt.free();

  const projects = [
    [
      'AutoCrib Car Rentals',
      'A fully optimised cross-platform mobile application for renting cars, built for Code7Solutions. Serves as the main developer, delivering scalable solutions with real-time booking, secure JWT authentication, and a PostgreSQL backend powering a smooth Expo Go experience.',
      'React Native, Node.js, PostgreSQL, JWT, Expo Go, REST API, Git',
      'https://github.com/Mathadaz/Portfolio',
      null,
      1,
      2025
    ],
    [
      'E-Commerce Shoe Store',
      'A full-stack web application for selling shoes to customers, developed during studies at CPUT. Built the complete backend with Java Spring Boot and a Vue.js frontend, with MYSQL for data storage and JWT tokens for secure user authentication.',
      'Java, Spring Boot, Vue.js, MySQL, JWT, IntelliJ, VSCode',
      'https://github.com/Mathadaz/Portfolio',
      null,
      1,
      2024
    ],
    [
      'Portfolio Website',
      'A personal developer portfolio built with Node.js, Express, Tailwind CSS and SQLite — the site you are viewing right now. Features a skills showcase, project gallery, experience timeline, contact form and an admin panel for managing projects.',
      'Node.js, Express, Tailwind CSS, SQLite, Handlebars, Vite',
      'https://github.com/Mathadaz/Portfolio',
      null,
      1,
      2025
    ],
  ];

  const projStmt = db.prepare('INSERT INTO projects (title, description, tech_stack, github_url, live_url, featured, year) VALUES (?, ?, ?, ?, ?, ?, ?)');
  projects.forEach(p => projStmt.run(p));
  projStmt.free();

  const experience = [
    [
      'Code7Solutions',
      'Software Developer',
      '2025 – 2026',
      'Developed and deployed high-quality web and mobile applications for clients using modern frameworks. Built RESTful APIs, designed optimised database schemas, and implemented JWT-based security to protect user data. Contributed to the full product lifecycle from planning through delivery.',
      1
    ],
    [
      'Cape Peninsula University of Technology',
      'ICT Application Development (Diploma)',
      '2022 – 2025',
      'Studied full-stack application development across web, mobile, and cloud platforms. Built projects using Java, Node.js, React, Python, and Azure. Graduated with hands-on experience in software engineering principles, OOP, data modelling, and cloud computing.',
      2
    ],
  ];

  const expStmt = db.prepare('INSERT INTO experience (company, role, period, description, sort_order) VALUES (?, ?, ?, ?, ?)');
  experience.forEach(e => expStmt.run(e));
  expStmt.free();

  saveDb();
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results[0] || null;
}

module.exports = { getDb, query, queryOne, saveDb };
