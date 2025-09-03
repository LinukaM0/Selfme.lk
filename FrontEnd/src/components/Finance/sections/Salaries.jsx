import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const Salaries = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/finance/salary')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Error fetching salaries:', err));
  }, []);

  const calculateSalary = (emp) => {
    const basic = emp.isManager ? 20000 : 10000;
    const start = new Date(emp.startDate);
    const end = new Date(emp.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const manpower = days * 3000;
    return basic + manpower;
  };

  const generatePDF = (emp) => {
    const doc = new jsPDF();
    doc.text(`Salary Slip for ${emp.name}`, 10, 10);
    doc.text(`Employee ID: ${emp.id}`, 10, 20);
    doc.text(`Role: ${emp.isManager ? 'Team Manager' : 'Employee'}`, 10, 30);
    doc.text(`Project Start Date: ${emp.startDate}`, 10, 40);
    doc.text(`Project End Date: ${emp.endDate}`, 10, 50);
    const salary = calculateSalary(emp);
    doc.text(`Basic Salary: ${emp.isManager ? 20000 : 10000}`, 10, 60);
    doc.text(`Manpower Allowance: ${salary - (emp.isManager ? 20000 : 10000)}`, 10, 70);
    doc.text(`Total Salary: ${salary}`, 10, 80);
    doc.save(`salary_slip_${emp.id}.pdf`);
  };

  const updateEmployee = (id) => {
    alert(`Update employee with ID: ${id}`);
    // Implement update logic (e.g., PATCH to /api/finance/salary/:id)
  };

  const deleteEmployee = (id) => {
    if (window.confirm(`Delete employee with ID: ${id}?`)) {
      axios.delete(`http://localhost:5000/api/finance/salary/${id}`)
        .then(() => setEmployees(employees.filter(emp => emp.id !== id)))
        .catch(err => console.error('Error deleting salary:', err));
    }
  };

  return (
    <div className="content-section">
      <h2>Manage Salaries</h2>
      <p>Process and track employee salaries and allowances here.</p>
      {employees.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Salary</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id || emp.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{emp.isManager ? 'Team Manager' : 'Employee'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{calculateSalary(emp)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => updateEmployee(emp.id)} style={{ marginRight: '5px' }}>Update</button>
                  <button onClick={() => deleteEmployee(emp.id)} style={{ marginRight: '5px' }}>Delete</button>
                  <button onClick={() => generatePDF(emp)}>Download Salary Slip (PDF)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading salaries...</p>
      )}
    </div>
  );
};

export default Salaries;