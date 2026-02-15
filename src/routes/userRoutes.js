const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCommercants,
  assignBoutique
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('administrateur'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.get('/commercants', getCommercants);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.post('/:userId/boutiques/:boutiqueId', assignBoutique);

module.exports = router;

