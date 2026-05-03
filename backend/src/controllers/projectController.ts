import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = new Project({ ...req.body, adminId: req.user.id });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};