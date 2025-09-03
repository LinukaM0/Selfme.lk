import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const Salaries = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ workingDays: 0, otherAllowance: 0, salaryStatus: 'Non-Paid' });
  const [error, setError] = useState(null);

  const months = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
    'July 2025', 'August 2025', 'September 2025'
  ];

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth]);

  const fetchSalaries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/finance/salary');
      let fetchedEmployees = response.data;

      // Adjust salary status based on month
      const currentMonthIndex = months.indexOf(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
      const selectedMonthIndex = months.indexOf(selectedMonth);
      fetchedEmployees = fetchedEmployees.map(emp => ({
        ...emp,
        salaryStatus: selectedMonthIndex < currentMonthIndex ? 'Paid' : emp.salaryStatus || 'Non-Paid'
      }));
      setEmployees(fetchedEmployees);
      setError(null);
    } catch (err) {
      setError('Error fetching salaries. Please check the backend server.');
      console.error('Error fetching salaries:', err);
    }
  };

  const calculateSalary = (emp) => {
    const perDayManpower = 3000;
    const basic = emp.isManager ? 20000 : 10000;
    const manpowerAllowance = perDayManpower * emp.workingDays;
    const total = basic + manpowerAllowance + (emp.otherAllowance || 0);
    return { basic, perDayManpower, manpowerAllowance, total };
  };

  const generatePDF = (emp, month) => {
    const { basic, perDayManpower, manpowerAllowance, total } = calculateSalary(emp);
    const doc = new jsPDF();
    const generateDate = new Date(month.split(' ')[1], months.indexOf(month), 28).toLocaleDateString();
    doc.text(`Salary Slip for ${emp.name} - ${month}`, 10, 10);
    doc.text(`Employee ID: ${emp.id}`, 10, 20);
    doc.text(`Role: ${emp.isManager ? 'Team Manager' : 'Employee'}`, 10, 30);
    doc.text(`Generate Date: ${generateDate}`, 10, 40);
    doc.text(`Basic Salary: ${basic}`, 10, 50);
    doc.text(`Per Day Manpower: ${perDayManpower}`, 10, 60);
    doc.text(`Working Days: ${emp.workingDays}`, 10, 70);
    doc.text(`Manpower Allowance: ${manpowerAllowance}`, 10, 80);
    doc.text(`Other Allowance: ${emp.otherAllowance || 0}`, 10, 90);
    doc.text(`Total Salary: ${total}`, 10, 100);
    doc.text(`Salary Status: ${emp.salaryStatus}`, 10, 110);
    doc.save(`salary_slip_${emp.id}_${month.replace(' ', '_')}.pdf`);
  };

  const handleUpdateClick = (emp) => {
    setEditingId(emp._id);
    setEditForm({
      workingDays: emp.workingDays,
      otherAllowance: emp.otherAllowance || 0,
      salaryStatus: emp.salaryStatus,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const saveUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/finance/salary/${editingId}`, {
        workingDays: parseInt(editForm.workingDays),
        otherAllowance: parseInt(editForm.otherAllowance),
        salaryStatus: editForm.salaryStatus,
      });
      fetchSalaries(); // Refresh data after update
      setEditingId(null);
    } catch (err) {
      setError('Error updating salary. Please try again.');
      console.error('Error updating salary:', err);
    }
  };

  const cancelUpdate = () => {
    setEditingId(null);
  };

  const deleteEmployee = async (id) => {
    if (window.confirm(`Delete employee with ID: ${id}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/finance/salary/${id}`);
        fetchSalaries(); // Refresh data after deletion
      } catch (err) {
        setError('Error deleting salary. Please try again.');
        console.error('Error deleting salary:', err);
      }
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="content-section">
      <h2>Manage Salaries</h2>
      <p>Process and track employee salaries and allowances here.</p>
      <div style={{ marginBottom: '10px' }}>
        <label>Select Month: </label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {employees.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Month</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Basic Salary</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Per Day Manpower</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Working Days</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Manpower Allowance</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Other Allowance</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Salary</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Salary Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const { basic, perDayManpower, manpowerAllowance, total } = calculateSalary(emp);
              return (
                <tr key={emp._id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.isManager ? 'Team Manager' : 'Employee'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{selectedMonth}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{basic}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{perDayManpower}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.workingDays}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{manpowerAllowance}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.otherAllowance || 0}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{total}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.salaryStatus}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button onClick={() => handleUpdateClick(emp)} style={{ marginRight: '5px' }}>Update</button>
                    <button onClick={() => deleteEmployee(emp.id)} style={{ marginRight: '5px' }}>Delete</button>
                    <button onClick={() => generatePDF(emp, selectedMonth)}>Download Salary Slip (PDF)</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>{error || 'Loading salaries...'}</p>
      )}
      {editingId && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>Edit Employee</h3>
          <p>Employee ID: {employees.find(emp => emp._id === editingId)?.id}</p>
          <p>Role: {employees.find(emp => emp._id === editingId)?.isManager ? 'Team Manager' : 'Employee'}</p>
          <div>
            <label>Working Days: </label>
            <input type="number" name="workingDays" value={editForm.workingDays} onChange={handleInputChange} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Other Allowance: </label>
            <input type="number" name="otherAllowance" value={editForm.otherAllowance} onChange={handleInputChange} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Salary Status: </label>
            <select name="salaryStatus" value={editForm.salaryStatus} onChange={handleInputChange}>
              <option value="Paid">Paid</option>
              <option value="Non-Paid">Non-Paid</option>
            </select>
          </div>
          <button onClick={saveUpdate} style={{ marginTop: '10px', marginRight: '5px' }}>Save</button>
          <button onClick={cancelUpdate} style={{ marginTop: '10px' }}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Salaries;