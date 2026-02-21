require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const itemRoutes = require('./routes/items');
const icdRoutes = require('./routes/icd');
const transcriptionRoutes = require('./routes/transcription');
const recordingsRoutes = require('./routes/recordings');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Universal Hackathon Starter API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/icd', icdRoutes);
app.use('/api', transcriptionRoutes);
app.use('/api', recordingsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
