const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Public
exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Public
exports.createTask = async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Public
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};
