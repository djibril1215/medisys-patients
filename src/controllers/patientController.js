const pool = require('../config/db');

// Creer un patient - rattache automatiquement a l'hopital de l'utilisateur connecte
const createPatient = async (req, res) => {
  const { nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies } = req.body;
  const hopital_id = req.user.hopital_id;

  if (!nom || !prenom) {
    return res.status(400).json({ message: 'Nom et prénom sont requis.' });
  }

  if (!hopital_id) {
    return res.status(403).json({ message: "Votre compte n'est rattache a aucun hopital." });
  }

  try {
    const newPatient = await pool.query(
      `INSERT INTO patients (nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies, hopital_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies, hopital_id]
    );

    res.status(201).json({ message: 'Patient créé avec succès.', patient: newPatient.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du patient.' });
  }
};

// Recuperer uniquement les patients de l'hopital de l'utilisateur connecte
const getAllPatients = async (req, res) => {
  const hopital_id = req.user.hopital_id;

  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE hopital_id = $1 ORDER BY created_at DESC',
      [hopital_id]
    );
    res.status(200).json({ patients: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des patients.' });
  }
};

// Recuperer un patient - uniquement s'il appartient a l'hopital de l'utilisateur
const getPatientById = async (req, res) => {
  const { id } = req.params;
  const hopital_id = req.user.hopital_id;

  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1 AND hopital_id = $2',
      [id, hopital_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé dans votre etablissement.' });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Modifier - uniquement si le patient appartient a l'hopital de l'utilisateur
const updatePatient = async (req, res) => {
  const { id } = req.params;
  const hopital_id = req.user.hopital_id;
  const { nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies } = req.body;

  try {
    const result = await pool.query(
      `UPDATE patients SET nom = $1, prenom = $2, date_naissance = $3, sexe = $4,
       telephone = $5, adresse = $6, antecedents_medicaux = $7, allergies = $8, updated_at = NOW()
       WHERE id = $9 AND hopital_id = $10 RETURNING *`,
      [nom, prenom, date_naissance, sexe, telephone, adresse, antecedents_medicaux, allergies, id, hopital_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé dans votre etablissement.' });
    }

    res.status(200).json({ message: 'Patient mis à jour avec succès.', patient: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

// Supprimer - uniquement si le patient appartient a l'hopital de l'utilisateur
const deletePatient = async (req, res) => {
  const { id } = req.params;
  const hopital_id = req.user.hopital_id;

  try {
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 AND hopital_id = $2 RETURNING *',
      [id, hopital_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé dans votre etablissement.' });
    }

    res.status(200).json({ message: 'Patient supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
};

// Route interne reservee au service hopitaux : recuperer un patient par ID, SANS filtre hopital
// (necessaire pour les transferts inter-hopitaux, qui doivent pouvoir lire un patient d'un autre hopital)
const getPatientForTransfer = async (req, res) => {
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

module.exports = {
  createPatient, getAllPatients, getPatientById, updatePatient, deletePatient, getPatientForTransfer,
};
