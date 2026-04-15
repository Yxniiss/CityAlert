const express = require("express"); // creer un server avec express
const mysql = require("mysql2"); // module pour se connecter à une base de données MySQL
const bcrypt = require("bcrypt"); // module pour hasher les mots de passe avant de les stocker dans la DB pour des raisons de sécurité
require('dotenv').config(); //sert a stocker des variable sensibles dans un fichier .env et les charger dans process.env
const jwt = require("jsonwebtoken");


const db = mysql.createConnection({ //creer une connexion a la DB en utilisant les variables d'environnement stocker dans .env
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const app = express(); // creer le serveur express
app.use(express.json()); // Middleware pour parser le corps de la requete en JSON



app.get('/', (req, res) => { // definir une route pour la racine du serveur pour tester le serveur
  res.send('Hello, World!');
});

app.post('/register', async (req, res) => {
  const { email, password, nom, prenom } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    
    if (err) {
      console.error('Error checking user existence:', err);
      res.status(500).send('Error checking user existence');
      return;
    }
    
    if (results.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const mdp = await bcrypt.hash(password, 10);// hasher le mot de passe avant de le stocker dans la DB pour des raisons de sécurité
    
    db.query('INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)', [email, mdp, nom, prenom], (err, results) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
        return;
      }
      res.status(201).json({ message: 'User registered', userId: results.insertId });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ error: 'User introuvable' });
    }
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password); // comparer le mot de passe fourni avec le mot de passe hashé stocké dans la DB

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // generer un token JWT qui contient l'id de l'utilisateur et qui expire dans 1 heure
    res.json({ message: 'Login successful', token });
  });
  
});



app.get('/reports', (req, res) => {
  db.query('SELECT * FROM reports', (err, results) => {
    if (err) {
      console.error('Error fetching reports:', err);
      res.status(500).send('Error fetching reports');
      return;
    }
    res.json(results);
  });
});

app.post('/reports', (req, res) => {
  const { title, description, latitude, longitude,image_url } = req.body; // recuperer les données du corps de la requete

  const user_id = 1; // pour l'instant on utilise un user_id statique, a remplacer par l'id de l'utilisateur connecté dans une version future
  db.query('INSERT INTO reports (user_id,title, description, latitude, longitude,image_url) VALUES (?, ?, ?, ?, ?, ?)', [user_id,title, description, latitude, longitude,image_url], (err, results) => {
    if (err) {
      console.error('Error inserting report:', err);
      res.status(500).send('Error inserting report');
      return;
    }
    else {
      res.status(201).json({ message: 'Report created', reportId: results.insertId });
    }
  });
});




db.query('SELECT 1', (err, results) => { // tester la connexion a la DB en executant une requete simple
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});


const PORT = process.env.PORT || 3000; // definir le port sur lequel le serveur va ecouter, soit celui defini dans les variables d'environnement ou 3000 par defaut
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); //demarer le server et afficher un message dans la console
});