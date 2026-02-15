import express from 'express';
import { 
  createCommunityPost, 
  getCommunityPosts, 
  addComment 
} from '../controllers/communityPostController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createCommunityPost);
router.get('/:communityId', getCommunityPosts);
router.post('/:postId/comment', auth, addComment);

export default router;
