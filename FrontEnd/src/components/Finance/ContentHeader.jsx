import React from 'react';

const ContentHeader = () => {
  return (
    <div className="content-header">
      <h1>Finance Management System</h1>
      <div className="header-actions">
        <button className="btn-secondary">Export Data</button>
        <button className="btn-primary">Quick Actions</button>
      </div>
    </div>
  );
};

export default ContentHeader;
