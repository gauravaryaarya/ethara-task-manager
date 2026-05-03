import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, adminKey } = req.body;

    if (role === 'Admin') {
      const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'ETHARA_2026'; 
      if (adminKey !== SECRET_KEY) {
        res.status(401).json({ error: 'Invalid Admin Secret Key' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role 
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) { 
      res.status(404).json({ error: 'User not found' }); 
      return; 
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { 
      res.status(400).json({ error: 'Invalid credentials' }); 
      return; 
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'Member' }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};