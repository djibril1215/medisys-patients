const pool = require('../config/db');

const createPatient = async (req, res) => {
  const { nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ message: 'Nom et prénom sont requis.' });
  }

  try {
    const newPatient = await pool.query(
      `INSERT INTO patients (nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies]
    );

    res.status(201).json({ message: 'Patient créé avec succès.', patient: newPatient.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du patient.' });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.status(200).json({ patients: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des patients.' });
  }
};

const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé.' });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies } = req.body;

  try {
    const result = await pool.query(
      `UPDATE patients SET nom = $1, prenom = $2, date_naissance = $3, sexe = $4,
       telephone = $5, adresse = $6, antecedents_medicaux = $7, allergies = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé.' });
    }

    res.status(200).json({ message: 'Patient mis à jour avec succès.', patient: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé.' });
    }

    res.status(200).json({ message: 'Patient supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
};

module.exports = { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient };
