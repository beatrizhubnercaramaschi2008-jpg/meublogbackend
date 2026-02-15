import express from 'express';
import { 
  createCommunity, 
  getCommunities, 
  joinCommunity, 
  leaveCommunity 
} from '../controllers/communityController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createCommunity);
router.get('/', getCommunities);
router.post('/:id/join', auth, joinCommunity);
router.post('/:id/leave', auth, leaveCommunity);

export default router;
