import CommunityPost from '../models/CommunityPost.js';
import Community from '../models/Community.js';

export const createCommunityPost = async (req, res) => {
  try {
    const { content, communityId } = req.body;
    
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada' });
    }
    
    // Verificar se é admin
    if (community.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Somente o admin pode fazer posts' });
    }
    
    const post = new CommunityPost({
      content,
      author: req.user.id,
      community: communityId,
      comments: []
    });
    
    await post.save();
    await post.populate('author', 'username profilePicture');
    
    community.posts.push(post._id);
    await community.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post', error: error.message });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const posts = await CommunityPost.find({ community: communityId })
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts', error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    
    const post = await CommunityPost.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            user: req.user.id,
            text,
            createdAt: Date.now()
          }
        }
      },
      { new: true }
    ).populate('author', 'username profilePicture')
     .populate('comments.user', 'username profilePicture');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar comentário', error: error.message });
  }
};
