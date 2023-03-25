const getAllUsers = 'SELECT * FROM users';

const getUserById = 'SELECT * FROM users WHERE id = $1';

const checkEmailExists = 'SELECT s FROM users s WHERE s.email = $1';

module.exports = {
  getAllUsers,
  getUserById,
  checkEmailExists,
};
