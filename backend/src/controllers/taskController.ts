import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, projectId, assignedTo, status, comment, attachmentName } = req.body as any;
    const userIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const taskPromises = userIds.map(userId => {
      return new Task({ title, projectId, assignedTo: userId, status, comment, attachmentName }).save();
    });
    await Promise.all(taskPromises);
    res.status(201).json({ message: 'Deployment successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tasks' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { projectId: req.params.projectId };
    if (req.user.role === 'Member') {
      query.assignedTo = req.user.id;
    }
    const tasks = await Task.find(query).populate('assignedTo', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (req.user.role === 'Member' && task.assignedTo.toString() !== req.user.id) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    task.status = req.body.status;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};