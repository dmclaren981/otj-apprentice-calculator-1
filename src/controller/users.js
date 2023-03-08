const pool = require('../../db');
const queries = require('../apprentices/queries')

const getAllUsers = async (req, res) => {
    pool.query(queries.getAllUsers, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getUserById, [id], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const addUser = (req, res) => {
    const { name, email, role } = req.body;
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        if (results.rows.length){
            res.send("Email already registered");
        }
    });
};




module.exports = {
    getAllUsers,
    getUserById,
    addUser,
}