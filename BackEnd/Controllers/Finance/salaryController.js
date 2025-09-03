const Salary = require('../../Model/Finance/salaryModel');
const Staff = require('../../Model/Finance/staffModel'); // Assuming staff model exists
const Job = require('../../Model/Finance/jobModel'); // Assuming job assigning model exists

exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.aggregate([
      {
        $lookup: {
          from: 'staffs', // Matches the collection name (lowercase plural in MongoDB)
          localField: 'empId',
          foreignField: 'empId',
          as: 'staffDetails'
        }
      },
      {
        $lookup: {
          from: 'jobs', // Matches the job assigning collection name
          localField: 'empId',
          foreignField: 'empId',
          as: 'jobDetails'
        }
      },
      { $unwind: '$staffDetails' },
      { $unwind: '$jobDetails' },
      {
        $project: {
          empId: '$empId',
          name: '$staffDetails.name',
          isManager: '$staffDetails.isManager',
          startDate: '$jobDetails.startDate',
          endDate: '$jobDetails.endDate'
        }
      }
    ]);
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSalary = async (req, res) => {
  const salary = new Salary(req.body);
  try {
    const newSalary = await salary.save();
    res.status(201).json(newSalary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const updatedSalary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSalary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Salary deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};