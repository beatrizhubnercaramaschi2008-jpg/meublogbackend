import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import communityPostRoutes from './routes/communityPostRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Erro de conexão MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/community-posts', communityPostRoutes);
app.use('/api/comments', commentRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
