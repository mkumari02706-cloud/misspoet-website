const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Method override for PUT/DELETE from forms
app.use((req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
});

// 📸 Multer Image Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }).single('poemImage');

// 📜 Helper: Read poems from JSON
const getPoems = () => {
  const filePath = path.join(__dirname, 'data', 'database.json');
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];
};

// 📝 Helper: Write poems to JSON
const savePoems = (poems) => {
  const filePath = path.join(__dirname, 'data', 'database.json');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(poems, null, 2));
};

// 📜 All Categories
const SYSTEM_CATEGORIES = [
  {
    id: 'latest',
    name: 'Latest Verses',
    banner:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200',
  },
  {
    id: 'lifted',
    name: 'Lifted',
    banner:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200',
  },
  {
    id: 'whispers',
    name: 'Whispers',
    banner:
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1200',
  },
  {
    id: 'rediscover',
    name: 'Rediscover',
    banner:
      'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1200',
  },
  {
    id: 'classics',
    name: 'Classics',
    banner:
      'https://images.unsplash.com/photo-14457369804613-52c61a468e7d?q=80&w=1200',
  },
  {
    id: 'college life',
    name: '🎓 College Life',
    banner:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200',
  },
  {
    id: "codder's life",
    name: "💻 Coder's Life",
    banner:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
  },
  {
    id: 'teachers',
    name: '👩‍🏫 Teachers & Guides',
    banner:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200',
  },
  {
    id: 'parents',
    name: '❤️ Mumma / Parents',
    banner:
      'https://images.unsplash.com/photo-1595608489609-419ed95c3671?q=80&w=1200',
  },
  {
    id: 'friendship',
    name: '🤝 Friendship Bonds',
    banner:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200',
  },
  {
    id: 'relations',
    name: '🏡 Family & Relations',
    banner:
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200',
  },
  {
    id: 'motivational',
    name: '🔥 Motivational Sparks',
    banner:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1200',
  },
  {
    id: 'emotional',
    name: '💧 Emotional Whispers',
    banner:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200',
  },
  {
    id: 'gazal',
    name: '📜 Gazal Collection',
    banner:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200',
  },
];

// ─────────────────────────────────────────
// 🏠 1. Home Feed
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  const poemsArray = getPoems();
  const selectedCatId = req.query.category || 'latest';
  const currentTheme =
    SYSTEM_CATEGORIES.find(
      (c) => c.id.toLowerCase() === selectedCatId.toLowerCase(),
    ) || SYSTEM_CATEGORIES[0];

  let filteredPoems = poemsArray;
  if (selectedCatId && selectedCatId !== 'all') {
    filteredPoems = poemsArray.filter(
      (p) =>
        p.category &&
        p.category.trim().toLowerCase() === selectedCatId.trim().toLowerCase(),
    );
  }

  res.render('index', {
    poems: filteredPoems,
    categories: SYSTEM_CATEGORIES,
    activeCategory: selectedCatId,
    themeBanner: currentTheme.banner,
    themeName: currentTheme.name,
  });
});

// ─────────────────────────────────────────
// ✒️ 2. Dashboard / Creator's Desk
// ─────────────────────────────────────────
app.get('/dashboard', (req, res) => {
  const poemsArray = getPoems();
  res.render('dashboard', {
    poems: poemsArray,
    categories: SYSTEM_CATEGORIES,
    activeCategory: 'dashboard',
    themeBanner:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200',
    themeName: "Creator's Desk Workspace",
  });
});

// ─────────────────────────────────────────
// 💾 3. Add New Poem (CREATE)
// ─────────────────────────────────────────
app.post('/add-poem', upload, (req, res) => {
  const poemsArray = getPoems();

  const newPoem = {
    id: Date.now().toString(),
    title: req.body.title || 'Untitled Verse',
    category: req.body.category || 'latest',
    body: req.body.body || '',
    image: req.file ? `/uploads/${req.file.filename}` : null,
    date: new Date().toISOString().split('T')[0],
  };

  poemsArray.unshift(newPoem);
  savePoems(poemsArray);
  res.redirect('/dashboard');
});

// ─────────────────────────────────────────
// 📖 4. Read Single Poem (READ)
// ─────────────────────────────────────────
app.get('/poem/:id', (req, res) => {
  const poemsArray = getPoems();
  // FIXED: Changed === to == for data type dynamic matching
  const poem = poemsArray.find((p) => p.id == req.params.id);
  if (!poem) return res.status(404).send('Poem not found');
  res.render('poem', {
    poem,
    categories: SYSTEM_CATEGORIES,
    activeCategory: poem.category,
    themeBanner:
      SYSTEM_CATEGORIES.find((c) => c.id === poem.category)?.banner ||
      SYSTEM_CATEGORIES[0].banner,
    themeName: poem.title,
  });
});

// ─────────────────────────────────────────
// ✏️ 5. Edit Poem Page (UPDATE - GET)
// ─────────────────────────────────────────
app.get('/edit/:id', (req, res) => {
  const poemsArray = getPoems();
  // FIXED: Changed === to == for data type dynamic matching
  const poem = poemsArray.find((p) => p.id == req.params.id);
  if (!poem) return res.status(404).send('Poem not found');
  res.render('edit', {
    poem,
    categories: SYSTEM_CATEGORIES,
    activeCategory: 'dashboard',
    themeBanner:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200',
    themeName: 'Edit Verse',
  });
});

// ─────────────────────────────────────────
// 💫 6. Save Edited Poem (UPDATE - POST)
// ─────────────────────────────────────────
app.post('/update/:id', upload, (req, res) => {
  const poemsArray = getPoems();
  // FIXED: Changed === to == for data type dynamic matching
  const index = poemsArray.findIndex((p) => p.id == req.params.id);
  if (index === -1) return res.status(404).send('Poem not found');

  poemsArray[index] = {
    ...poemsArray[index],
    title: req.body.title || poemsArray[index].title,
    category: req.body.category || poemsArray[index].category,
    body: req.body.body || poemsArray[index].body,
    image: req.file ? `/uploads/${req.file.filename}` : poemsArray[index].image,
  };

  savePoems(poemsArray);
  res.redirect('/dashboard');
});

// ─────────────────────────────────────────
// 🗑️ 7. Delete Poem (DELETE - POST)
// ─────────────────────────────────────────
app.post('/delete/:id', (req, res) => {
  let poemsArray = getPoems();
  // FIXED: Changed !== to != for flexible string/number type matching
  poemsArray = poemsArray.filter((p) => p.id != req.params.id);
  savePoems(poemsArray);
  res.redirect('/dashboard');
});

// 🚀 Server Start
app.listen(3000, () => {
  console.log('Miss Poet server running beautifully on port 3000 ✨');
});
