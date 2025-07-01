import React from 'react';
import { Table } from 'antd';

const EmployeeCategory = ({ type }) => {
  const data = [
    { key: '1', name: 'John Doe', position: 'Manager' },
    { key: '2', name: 'Jane Smith', position: 'Supervisor' }
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Position', dataIndex: 'position', key: 'position' }
  ];

  return (
    <div>
      <h2>{type === 'executive' ? 'Executive' : 'Non-Executive'} Staff</h2>
      <Table 
        dataSource={data} 
        columns={columns} 
        rowKey="key"
      />
    </div>
  );
};

export default EmployeeCategory;