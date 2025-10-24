
import React, { useState } from 'react';
import Spinner from './Spinner';
import Table from './Table';
import { Button, Alert } from 'react-bootstrap';

const ActiveQueryTab = () => {
    const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const response = await fetch('/api/toolbox?tool=list_active_queries');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch');
      }

      let parsedData = result;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (e) {
          throw new Error('Failed to parse data from API');
        }
      }

      if (Array.isArray(parsedData)) {
        setData(parsedData);
        setError(null);
      } else if (parsedData === null) {
        setData([]);
        setError(null);
      } else {
        throw new Error('Invalid data format from API');
      }

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Active Postgres Queries</h2>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'List Active Queries'}
      </Button>
      <div className="d-flex justify-content-center mt-3">
        {loading && <Spinner />}
      </div>
      {!loading && error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {!loading && data && <div className="mt-3"><Table data={data} noDataMessage="No Active queries found" /></div>}
    </div>
  );
};

export default ActiveQueryTab;
