import express from 'express';
import { 
  createStory, 
  getStories, 
  getStoryById, 
  updateStory, 
  deleteStory,
  likeStory 
} from '../controllers/storyController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createStory);
router.get('/', getStories);
router.get('/:id', getStoryById);
router.put('/:id', auth, updateStory);
router.delete('/:id', auth, deleteStory);
router.post('/:id/like', auth, likeStory);

export default router;
