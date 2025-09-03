const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  empId: { type: String, required: true },
  name: { type: String, required: true },
  isManager: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  basicSalary: { type: Number },
  manpowerAllowance: { type: Number },
  totalSalary: { type: Number }
});

module.exports = mongoose.model('Salary', salarySchema);