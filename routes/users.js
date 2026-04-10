const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD Operations
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/search/name', userController.searchByName);
router.get('/search/filter', userController.filterUsers);
router.get('/search/hobbies', userController.findByHobbies);
router.get('/search/text', userController.textSearch);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
