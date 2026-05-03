import express from 'express';
import { createProject, getProjects } from '../controllers/projectController';
import { createTask, getTasks, updateTaskStatus } from '../controllers/taskController';
import { verifyToken, isAdmin } from '../middleware/auth';
import { register, login, getUsers } from '../controllers/authController';
import User from '../models/User';

const router = express.Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/users', verifyToken, getUsers);
router.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Projects
router.post('/projects', verifyToken, isAdmin, createProject);
router.get('/projects', verifyToken, getProjects);

// Tasks
router.post('/tasks', verifyToken, isAdmin, createTask);
router.get('/tasks/:projectId', verifyToken, getTasks);
router.put('/tasks/:taskId', verifyToken, updateTaskStatus);

export default router;