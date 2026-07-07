const express = require('express');
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientForTransfer,
} = require('../controllers/patientController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createPatient);
router.get('/', verifyToken, getAllPatients);

// Route interne utilisee par medisys-hopitaux pour recuperer un patient lors d'un transfert
// (placee AVANT /:id pour ne pas etre interceptee par la route generique)
router.get('/internal/:id', verifyToken, getPatientForTransfer);

router.get('/:id', verifyToken, getPatientById);
router.put('/:id', verifyToken, updatePatient);
router.delete('/:id', verifyToken, deletePatient);

module.exports = router;
