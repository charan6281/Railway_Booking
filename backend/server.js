require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Railway Reservation API' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trains', require('./routes/trains'));
app.use('/api/bookings', require('./routes/bookings'));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => app.listen(PORT, () => console.log(`Railway Reservation running at http://localhost:${PORT}`)))
  .catch(err => { console.error('Unable to start:', err.message); process.exit(1); });
