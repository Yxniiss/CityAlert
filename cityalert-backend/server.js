const cors = require('cors'); // module pour gérer les requetes cross-origin, permet au frontend de faire des requetes vers le backend depuis un domaine différent  
const express = require("express"); // creer un server avec express
const mysql = require("mysql2"); // module pour se connecter à une base de données MySQL
const bcrypt = require("bcrypt"); // module pour hasher les mots de passe avant de les stocker dans la DB pour des raisons de sécurité
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

fs.mkdirSync('uploads', { recursive: true }); //sert a stocker des variable sensibles dans un fichier .env et les charger dans process.env
const jwt = require("jsonwebtoken");



const db = mysql.createPool({ //creer un pool de connexions a la DB en utilisant les variables d'environnement stocker dans .env
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const app = express(); // creer le serveur express

/*app.use((req, res, next) => { // Middleware pour logger les requetes entrantes dans la console pour faciliter le debug
  console.log(`${req.method} ${req.url} ${req.headers.origin}`);
  next();
});*/
app.use(cors({
  origin: 'http://localhost:5173', // Remplacez par l'URL de votre frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', "OPTIONS", "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization' ],
  preflightContinue: false,
})); // Middleware pour activer CORS et permettre les requetes cross-origin entre le frontend et le backend 

app.use(express.json()); // Middleware pour parser le corps des requetes en JSON, permet de recuperer les données envoyées par le frontend dans req.body
app.use('/uploads', express.static('uploads'));


function authMiddleware(req, res, next) { // Middleware pour verifier le token JWT dans les requetes qui necessitent une authentification
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // extraire le token de l'en-tete Authorization
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    req.user = decoded;
    next();
  });
}

function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const userId = req.user.userId; // recuperer le role de l'utilisateur a partir du token JWT
    db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching user role' });
      }
      if (!results.length || results[0].role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }
      next();
    });
  };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + '.' + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont acceptées'));
    }
    cb(null, true);
  }
});

app.get('/', (req, res) => { // definir une route pour la racine du serveur pour tester le serveur
  console.log("Received request to /");
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
    
    db.query('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)', [email, mdp, nom, prenom, 'user'], (err, results) => {
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

    if (err) {
      return res.status(500).json({ error: 'Error fetching user' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'User introuvable' });
    }
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password); // comparer le mot de passe fourni avec le mot de passe hashé stocké dans la DB

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user: { nom: user.nom, prenom: user.prenom, role: user.role } });
  });

  
});



app.get('/reports', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sort = req.query.sort;

  const allowedSort = ['id', 'priority'];
  const sortField = allowedSort.includes(sort) ? sort : 'id';

  db.query(`SELECT * FROM reports ORDER BY ${sortField} DESC LIMIT ? OFFSET ?`,[limit, offset],(err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching reports' });
      }

      res.json({ page, limit, count: results.length, results});
    }
  );
});

app.post('/reports', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  const image_url = req.file ? req.file.filename : '';
  const user = jwt.decode(req.headers.authorization.split(' ')[1]); // decoder le token JWT pour recuperer l'id de l'utilisateur qui a fait la requete
  const user_id = user.userId; // utiliser l'id de l'utilisateur connecté
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Champs obligatoires' });
  }
  if (!latitude || !longitude || parseFloat(latitude) === 0 || parseFloat(longitude) === 0) {
    return res.status(400).json({ error: 'Localisation obligatoire' });
  }

  db.query(
    'SELECT * FROM reports WHERE latitude = ? AND longitude = ?', [latitude, longitude], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error checking reports' });
      }

      if (results.length > 0) {
        const report = results[0];

        db.query(
          'UPDATE reports SET report_count = report_count + 1 WHERE id = ?', [report.id], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error updating report count' });
            }

            return res.json({ message: 'Signalement déjà existant', reportId: report.id});
          }
        );
      }

      else {
        db.query('INSERT INTO reports (user_id, title, description, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, title, description, latitude, longitude, image_url],
          
          (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error inserting report' });
            }

            res.status(201).json({ message: 'Report created', reportId: results.insertId});
          }
        );
      }
    }
  );
});

app.get('/my-reports', authMiddleware, (req, res) => {
  const userid = req.user.userId;
  db.query('SELECT * FROM reports WHERE user_id = ?', [userid], (err, results) => {
    if (err) {
      console.error('Error fetching user reports:', err);
      return res.status(500).json({ error: 'Error fetching user reports:' });
    }
    if (results.length === 0) {
      return res.json([]);
    }

    res.json(results);
  });
});

app.put('/reports/:id', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.userId;
  const { title, description } = req.body;

  if (!title || !description) return res.status(400).json({ error: 'Titre et description obligatoires' });

  db.query('SELECT * FROM reports WHERE id = ? AND user_id = ?', [reportId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!results.length) return res.status(403).json({ error: 'Signalement introuvable ou non autorisé' });

    const image_url = req.file ? req.file.filename : results[0].image_url;

    db.query(
      'UPDATE reports SET title = ?, description = ?, image_url = ? WHERE id = ?',
      [title, description, image_url, reportId],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        res.json({ message: 'Signalement mis à jour' });
      }
    );
  });
});

app.delete('/reports/:id', authMiddleware, (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.userId;

  db.query('SELECT * FROM reports WHERE id = ? AND user_id = ?', [reportId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!results.length) return res.status(403).json({ error: 'Signalement introuvable ou non autorisé' });

    db.query('DELETE FROM reports WHERE id = ?', [reportId], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de la suppression' });
      res.json({ message: 'Signalement supprimé' });
    });
  });
});

app.get('/profile', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  db.query('SELECT id, email, nom, prenom FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching profile' });
    if (!results.length) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

app.put('/profile', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const { nom, prenom } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  db.query('UPDATE users SET nom = ?, prenom = ? WHERE id = ?', [nom, prenom, userId], (err) => {
    if (err) return res.status(500).json({ error: 'Error updating profile' });
    res.json({ message: 'Profil mis à jour', nom, prenom });
  });
});

app.get('/admin/reports', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const status = req.query.status || 'pending';
  db.query('SELECT r.*, u.nom, u.prenom FROM reports r JOIN users u ON r.user_id = u.id WHERE r.status = ?', [status], (err, results) => {
    if (err) {
      console.error('Error fetching reports by status:', err);
      return res.status(500).json({ error: 'Error fetching reports by status' });
    }
    res.json({count: results.length,reports: results });
  });
});

app.put('/admin/reports/:id/approve', authMiddleware,roleMiddleware('admin'), (req, res) => {
  const reportId = req.params.id;
  db.query('UPDATE reports SET status = ? WHERE id = ?', ['approved', reportId], (err) => {
    if (err) {
      console.error('Error approving report:', err);
      return res.status(500).json({ error: 'Error approving report' });
    }
    res.json({ message: 'Report approved' });
  });
});

app.put('/admin/reports/:id/reject', authMiddleware,roleMiddleware('admin'), (req, res) => {
  const reportId = req.params.id;
  db.query('UPDATE reports SET status = ? WHERE id = ?', ['rejected', reportId], (err) => {
    if (err) {
      console.error('Error rejecting report:', err);
      return res.status(500).json({ error: 'Error rejecting report' });
    }
    res.json({ message: 'Report rejected' });
  });
});

app.put('/admin/reports/:id/resolve', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const reportId = req.params.id;
  db.query('UPDATE reports SET status = ? WHERE id = ?', ['resolved', reportId], (err) => {
    if (err) {
      console.error('Error resolving report:', err);
      return res.status(500).json({ error: 'Error resolving report' });
    }
    res.json({ message: 'Report resolved' });
  });
});

app.get('/stats', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.query('SELECT COUNT(*) as total FROM reports', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching stats' });
    }

    db.query('SELECT COUNT(*) as totalUsers FROM users', (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching user stats' });
      }
      res.json({
        totalReports: results[0].total,
        totalUsers: userResults[0].totalUsers
      });
    });
  });
});

app.get('/stats/status', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.query('SELECT status, COUNT(*) AS count FROM reports GROUP BY status', (err, results) => {
    if (err) {
      console.error('Error fetching report stats:', err);
      return res.status(500).json({ error: 'Error fetching report stats' });
    }
    res.json(results);
  });
});

app.get('/stats/priority', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.query('SELECT priority, COUNT(*) AS count FROM reports GROUP BY priority', (err, results) => {
    if (err) {
      console.error('Error fetching report stats:', err);
      return res.status(500).json({ error: 'Error fetching report stats' });
    }
    res.json(results);
  });
});


app.get('/public/stats', (req, res) => {
  db.query(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN status IN ('pending','approved') THEN 1 ELSE 0 END) AS active
    FROM reports`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      const { total, resolved, active } = results[0];
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      res.json({ total, resolved, active, resolutionRate });
    }
  );
});

app.get('/admin/users', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.query('SELECT id, email, nom, prenom, role FROM users ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching users' });
    res.json({ count: results.length, users: results });
  });
});

app.put('/admin/users/:id/role', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const targetId = parseInt(req.params.id);
  const { role } = req.body;
  const allowedRoles = ['user', 'admin', 'moderateur'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  if (targetId === req.user.userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });
  }

  db.query('UPDATE users SET role = ? WHERE id = ?', [role, targetId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ message: 'Rôle mis à jour' });
  });
});

const PORT = process.env.PORT || 3000; // definir le port sur lequel le serveur va ecouter, soit celui defini dans les variables d'environnement ou 3000 par defaut
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); //demarer le server et afficher un message dans la console
});