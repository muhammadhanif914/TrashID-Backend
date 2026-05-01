const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    
    // Cek apakah email atau username sudah pernah dipakai
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'Email atau Username sudah digunakan' });

    const user = await User.create({ name, username, email, password, role });
    res.status(201).json({
      _id: user._id, name: user.name, username: user.username, email: user.email, role: user.role, xp: user.xp,
      token: generateToken(user._id)
    });
  } catch (error) {
    // Tangkap error jika ada field wajib yang belum terisi
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Login menggunakan variabel identitas (boleh pakai email atau username)
    // Sesuai desain UI: "Username atau Email"
    const identifier = req.body.identifier || req.body.email || req.body.username;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Harap masukkan Username/Email dan Password' });
    }

    // Cari user berdasarkan email atau username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id, name: user.name, username: user.username, email: user.email, role: user.role, xp: user.xp,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Username/Email atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};