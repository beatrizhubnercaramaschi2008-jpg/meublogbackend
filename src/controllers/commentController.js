import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { storyId } = req.params;
    
    const comment = new Comment({
      text,
      author: req.user.id,
      story: storyId
    });
    
    await comment.save();
    await comment.populate('author', 'username profilePicture');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar comentário', error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const comments = await Comment.find({ story: storyId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar comentários', error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar comentário', error: error.message });
  }
};
