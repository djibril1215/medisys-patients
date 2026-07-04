const express = require('express');
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createPatient);
router.get('/', verifyToken, getAllPatients);
router.get('/:id', verifyToken, getPatientById);
router.put('/:id', verifyToken, updatePatient);
router.delete('/:id', verifyToken, deletePatient);

module.exports = router;
