
import React, { useState } from 'react';
import Spinner from './Spinner';
import { Button, Card, Alert } from 'react-bootstrap';

const IndexCard = ({ indexData }: { indexData: any }) => {
  return (
    <Card className="mb-3">
      <Card.Header as="h5">{indexData.index_name}</Card.Header>
      <Card.Body>
        <Card.Title>Index Definition</Card.Title>
        <pre><code>{indexData.index_def}</code></pre>
        <Card.Text>
          <strong>Table:</strong> {indexData.schema_name}.{indexData.table_name}<br />
          <strong>Size:</strong> {indexData.index_size}<br />
          <strong>Is Ready:</strong> {indexData.indisready ? 'Yes' : 'No'}<br />
          <strong>Is Valid:</strong> {indexData.indisvalid ? 'Yes' : 'No'}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const InvalidIndexes = () => {
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const listInvalidIndexes = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/toolbox?tool=list_invalid_indexes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      let parsedData = data;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (e) {
          throw new Error('Failed to parse data from API');
        }
      }
      
      if (Array.isArray(parsedData)) {
        setResult(parsedData);
      } else {
        setResult([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <h2>List Invalid Postgres Indexes</h2>
      <Button onClick={listInvalidIndexes} disabled={loading}>
        {loading ? 'Loading...' : 'List Invalid Indexes'}
      </Button>
      <div className="d-flex justify-content-center mt-3">
        {loading && <Spinner />}
      </div>
      {!loading && error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {!loading && result && result.length > 0 && result.map((index, i) => (
        <IndexCard key={i} indexData={index} />
      ))}
      {!loading && result && result.length === 0 && <p className="mt-3">No invalid indexes found.</p>}
    </div>
  );
};

export default InvalidIndexes;
