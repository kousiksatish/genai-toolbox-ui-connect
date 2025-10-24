
import React, { useState } from 'react';
import Spinner from './Spinner';
import Table from './Table';
import { Button, Form, Alert } from 'react-bootstrap';

const ExecuteQueryTab = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sql, setSql] = useState('SELECT * FROM products;');
  const [loading, setLoading] = useState(false);

  const handleSqlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSql(event.target.value);
  };

  const handleClick = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const response = await fetch('/api/toolbox?tool=execute_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sql }),
      });
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
      <h2>Execute SQL</h2>
      <Form>
        <Form.Group controlId="sqlTextarea">
          <Form.Control
            as="textarea"
            rows={5}
            value={sql}
            onChange={handleSqlChange}
          />
        </Form.Group>
        <Button onClick={handleClick} disabled={loading} className="mt-2">
          {loading ? 'Executing...' : 'Execute'}
        </Button>
      </Form>
      <div className="d-flex justify-content-center mt-3">
        {loading && <Spinner />}
      </div>
      {!loading && error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {!loading && data && <div className="mt-3"><Table data={data} noDataMessage="No results found" /></div>}
    </div>
  );
};

export default ExecuteQueryTab;
