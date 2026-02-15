import Story from '../models/Story.js';

export const createStory = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const story = new Story({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.id
    });
    
    await story.save();
    await story.populate('author', 'username profilePicture');
    
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar história', error: error.message });
  }
};

export const getStories = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'todos') {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const stories = await Story.find(query)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Story.countDocuments(query);
    
    res.json({
      stories,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórias', error: error.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username profilePicture');
    
    if (!story) {
      return res.status(404).json({ message: 'História não encontrada' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar história', error: error.message });
  }
};

export const updateStory = async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'História não encontrada' });
    }
    
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado' });
    }
    
    story = await Story.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'username profilePicture');
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar história', error: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'História não encontrada' });
    }
    
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'História deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar história', error: error.message });
  }
};

export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'História não encontrada' });
    }
    
    const userLiked = story.likes.includes(req.user.id);
    
    if (userLiked) {
      story.likes = story.likes.filter(id => id.toString() !== req.user.id);
    } else {
      story.likes.push(req.user.id);
    }
    
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao dar like', error: error.message });
  }
};
