const express = require('express');
const cors = require('cors');
require('dotenv').config();
const patientRoutes = require('./routes/patientRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'MediSys Patients Service is running' });
});

app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Patients service running on port ${PORT}`);
});
