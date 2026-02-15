import Community from '../models/Community.js';
import CommunityPost from '../models/CommunityPost.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const community = new Community({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id]
    });
    
    await community.save();
    await community.populate('admin', 'username profilePicture');
    
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar comunidade', error: error.message });
  }
};

export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('admin', 'username profilePicture')
      .populate('members', 'username')
      .sort({ createdAt: -1 });
    
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar comunidades', error: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada' });
    }
    
    if (!community.members.includes(req.user.id)) {
      community.members.push(req.user.id);
      await community.save();
    }
    
    await community.populate('admin', 'username profilePicture');
    await community.populate('members', 'username');
    
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao entrar na comunidade', error: error.message });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada' });
    }
    
    community.members = community.members.filter(id => id.toString() !== req.user.id);
    await community.save();
    
    res.json({ message: 'Você saiu da comunidade' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao sair da comunidade', error: error.message });
  }
};
