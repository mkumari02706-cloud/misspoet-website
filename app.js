const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
 
// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
 
// 🔒 Session Setup
app.use(session({
  secret: 'misspoet_aesthetic_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
 
// 🛡️ Guard Middleware
function requireAdminLogin(req, res, next) {
  if (req.session && req.session.isAdminLoggedIn) {
    return next();
  }
  res.redirect('/login');
}
 
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
 
const uploadInstance = multer({ storage: storage });
 
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
 
// 🖼️ Helper: Read custom banners
const getCustomBanners = () => {
  const filePath = path.join(__dirname, 'data', 'banners.json');
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : {};
};
 
// 💾 Helper: Save custom banners
const saveCustomBanners = (banners) => {
  const filePath = path.join(__dirname, 'data', 'banners.json');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(banners, null, 2));
};
 
// 📜 All Categories
const SYSTEM_CATEGORIES = [
  { id: 'latest', name: 'Latest Verses', banner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200' },
  { id: 'lifted', name: 'Lifted', banner: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200' },
  { id: 'whispers', name: 'Whispers', banner: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1200' },
  { id: 'rediscover', name: 'Rediscover', banner: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1200' },
  { id: 'classics', name: 'Classics', banner: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200' },
  { id: 'college life', name: '🎓 College Life', banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200' },
  { id: "codder's life", name: "💻 Coder's Life", banner: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200' },
  { id: 'teachers', name: '👩‍🏫 Teachers & Guides', banner: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200' },
  { id: 'parents', name: '❤️ Mumma / Parents', banner: 'https://images.unsplash.com/photo-1595608489609-419ed95c3671?q=80&w=1200' },
  { id: 'friendship', name: '🤝 Friendship Bonds', banner: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200' },
  { id: 'relations', name: '🏡 Family & Relations', banner: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200' },
  { id: 'motivational', name: '🔥 Motivational Sparks', banner: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1200' },
  { id: 'emotional', name: '💧 Emotional Whispers', banner: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200' },
  { id: 'gazal', name: '📜 Gazal Collection', banner: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200' }
];
 
// ─────────────────────────────────────────
// 🏠 1. Home Feed
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  const poemsArray = getPoems();
  const selectedCatId = req.query.category || 'latest';
  const customBanners = getCustomBanners();
 
  const currentTheme =
    SYSTEM_CATEGORIES.find((c) => c.id.toLowerCase() === selectedCatId.toLowerCase()) || SYSTEM_CATEGORIES[0];
 
  const finalBanner = customBanners[selectedCatId.toLowerCase()] || currentTheme.banner;
 
  let filteredPoems = poemsArray;
  if (selectedCatId && selectedCatId !== 'all') {
    filteredPoems = poemsArray.filter(
      (p) => p.category && p.category.trim().toLowerCase() === selectedCatId.trim().toLowerCase()
    );
  }
 
  res.render('index', {
    poems: filteredPoems,
    categories: SYSTEM_CATEGORIES,
    activeCategory: selectedCatId,
    themeBanner: finalBanner,
    themeName: selectedCatId === 'all' ? 'All Collections' : currentTheme.name,
    isAdmin: req.session && req.session.isAdminLoggedIn ? true : false,
  });
});
 
// ─────────────────────────────────────────
// 🔐 2. Login Page — now uses login.ejs properly
// ─────────────────────────────────────────
app.get('/login', (req, res) => {
  // Agar already logged in hai toh seedha dashboard
  if (req.session && req.session.isAdminLoggedIn) {
    return res.redirect('/dashboard');
  }
  res.render('login');
});
 
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'MISS POET CLUB' && password === 'WELCOME TO MY WORLD') {
    req.session.isAdminLoggedIn = true;
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Incorrect credentials. Access denied.' });
  }
});
 
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
 
// ─────────────────────────────────────────
// ✒️ 3. Dashboard (🔒 PROTECTED)
// ─────────────────────────────────────────
app.get('/dashboard', requireAdminLogin, (req, res) => {
  const poemsArray = getPoems();
  res.render('dashboard', {
    poems: poemsArray,
    categories: SYSTEM_CATEGORIES,
    activeCategory: 'dashboard',
    themeBanner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200',
    themeName: "Creator's Desk",
  });
});
 
// ─────────────────────────────────────────
// 💾 4. Add New Poem (🔒 PROTECTED)
// ─────────────────────────────────────────
app.post('/add-poem', requireAdminLogin, uploadInstance.single('poemImage'), (req, res) => {
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
// 📸 5. Update Banner (🔒 PROTECTED) — FIXED: activeCategory ab sahi se save hoga
// ─────────────────────────────────────────
app.post('/update-banner', requireAdminLogin, uploadInstance.single('bannerImage'), (req, res) => {
  try {
    // activeCategory form se aata hai; fallback 'latest'
    const activeCat = (req.body.activeCategory || 'latest').trim().toLowerCase();
 
    if (req.file) {
      const customBanners = getCustomBanners();
      customBanners[activeCat] = `/uploads/${req.file.filename}`;
      saveCustomBanners(customBanners);
      console.log(`Banner updated for category: ${activeCat}`);
    }
 
    // Redirect back to same category page
    const redirectUrl = activeCat === 'all' ? '/?category=all' : `/?category=${encodeURIComponent(activeCat)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Banner update error:', error);
    res.status(500).send('Banner update mein error aaya.');
  }
});
 
// ─────────────────────────────────────────
// 📖 6. Read Single Poem (Public)
// ─────────────────────────────────────────
app.get('/poem/:id', (req, res) => {
  const poemsArray = getPoems();
  const poem = poemsArray.find((p) => p.id == req.params.id);
  if (!poem) return res.status(404).send('Poem not found');
 
  const customBanners = getCustomBanners();
  const defaultBanner =
    SYSTEM_CATEGORIES.find((c) => c.id === poem.category)?.banner || SYSTEM_CATEGORIES[0].banner;
  const finalBanner = customBanners[poem.category.toLowerCase()] || defaultBanner;
 
  res.render('poem', {
    poem,
    categories: SYSTEM_CATEGORIES,
    activeCategory: poem.category,
    themeBanner: finalBanner,
    themeName: poem.title,
  });
});
 
// ─────────────────────────────────────────
// ✏️ 7. Edit Poem Page (🔒 PROTECTED)
// ─────────────────────────────────────────
app.get('/edit/:id', requireAdminLogin, (req, res) => {
  const poemsArray = getPoems();
  const poem = poemsArray.find((p) => p.id == req.params.id);
  if (!poem) return res.status(404).send('Poem not found');
  res.render('edit', {
    poem,
    categories: SYSTEM_CATEGORIES,
    activeCategory: 'dashboard',
    themeBanner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200',
    themeName: 'Edit Verse',
  });
});
 
// ─────────────────────────────────────────
// 💫 8. Save Edited Poem (🔒 PROTECTED)
// ─────────────────────────────────────────
app.post('/update/:id', requireAdminLogin, uploadInstance.single('poemImage'), (req, res) => {
  const poemsArray = getPoems();
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
// 🗑️ 9. Delete Poem (🔒 PROTECTED)
// ─────────────────────────────────────────
app.post('/delete/:id', requireAdminLogin, (req, res) => {
  let poemsArray = getPoems();
  poemsArray = poemsArray.filter((p) => p.id != req.params.id);
  savePoems(poemsArray);
  res.redirect('/dashboard');
});
 
// 🚀 Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Miss Poet server running on port ${PORT} ✨`);
});
 
