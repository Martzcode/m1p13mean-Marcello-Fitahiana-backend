const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    getTask,
} = require('../controllers/taskController');

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask);

module.exports = router;
