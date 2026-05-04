const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addXp = async (req, res) => {
  try {
    const { xp } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.xp += xp || 10;
    await user.save();
    res.json({ message: 'XP added', xp: user.xp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update kolom jika ada isian baru dari body
    user.fullName = req.body.fullName || user.fullName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    
    // Khusus password, model (User.js) kita sudah punya fungsi pre("save")
    // yang akan meng-hash password baru otomatis jika terdeteksi berubah.
    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      xp: updatedUser.xp,
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    // Tangani jika update ke e-mail/username yang sudah terpakai
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email atau Username tersebut sudah digunakan oleh pengguna lain' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
