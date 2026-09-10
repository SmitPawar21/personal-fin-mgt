const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repositories');
const env = require('../config/env');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const users = await UserRepository.find({ username });
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const existingUsers = await UserRepository.find({ username });
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Assume all subsequent registered users are 'user', or keep 'admin' logic if none exists
    const usersCount = await UserRepository.find({});
    const role = usersCount.length === 0 ? 'admin' : 'user';

    const newUser = await UserRepository.insert({
      username,
      password_hash,
      role
    });

    const payload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyFamily = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (password === env.FAMILY_PASSWORD) {
      return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid family password' });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await UserRepository.find({});
    // Return only usernames and ids
    const safeUsers = users.map(u => ({ id: u.id, username: u.username }));
    res.status(200).json(safeUsers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  register,
  verifyFamily,
  getUsers
};
