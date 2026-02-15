import express from 'express';
import { 
  addComment, 
  getComments, 
  deleteComment 
} from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/:storyId', auth, addComment);
router.get('/:storyId', getComments);
router.delete('/:id', auth, deleteComment);

export default router;
