
import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';

const Table = ({ data, noDataMessage }: { data: any[], noDataMessage?: string }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>{noDataMessage || 'No data to display'}</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <BootstrapTable striped bordered hover responsive>
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {headers.map(header => (
              <td key={header}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </BootstrapTable>
  );
};

export default Table;
