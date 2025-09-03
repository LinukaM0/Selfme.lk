const express = require('express');
const router = express.Router();
const salaryController = require('../../Controllers/Finance/salaryController');

router.get('/', salaryController.getAllSalaries);
router.post('/', salaryController.createSalary);
router.put('/:id', salaryController.updateSalary);
router.delete('/:id', salaryController.deleteSalary);

module.exports = router;