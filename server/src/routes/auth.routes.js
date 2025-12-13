import { Router } from 'express';
import { validate, registerSchema, loginSchema } from '../validators/user.validator.js';
import User from '../models/user.model.js';

const router = Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // 2. Create new user (password will be hashed by middleware in model)
    const newUser = new User({
      name,
      email,
      passwordHash: password, // Pass the plain password to be hashed by the pre-save hook
    });

    await newUser.save();

    // In a real app, you'd generate tokens here and send them back
    res.status(201).json({ 
        message: 'User registered successfully. Please log in.',
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validate(loginSchema), (req, res) => {
    // Logic for login will be added here
    res.json({ message: 'User login endpoint' });
});

// @route   POST api/auth/logout
// @desc    Logout user and clear cookie
// @access  Private
router.post('/logout', (req, res) => {
    // Logic for logout will be added here
    res.json({ message: 'User logout endpoint' });
});

// @route   GET api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', (req, res) => {
    // This will be handled by Passport.js
    res.send('Redirecting to Google for authentication...');
});

// @route   GET api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', (req, res) => {
    // Passport.js will handle the callback and redirect
    res.send('Successfully authenticated with Google!');
});

export default router;
