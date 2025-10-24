
import { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import ExecuteQueryTab from '../components/ExecuteQueryTab';
import InvalidIndexes from '../components/InvalidIndexes';
import ActiveQueryTab from '../components/ActiveQueryTab';

const HomePage = () => {
  const [key, setKey] = useState('toolbox');

  return (
    <Tabs
      id="controlled-tab-example"
      activeKey={key}
      onSelect={(k) => setKey(k as string)}
      className="mb-3"
    >
      <Tab eventKey="toolbox" title="Execute SQL">
        <ExecuteQueryTab />
      </Tab>
      <Tab eventKey="new" title="Invalid Indexes">
        <InvalidIndexes />
      </Tab>
      <Tab eventKey="active_queries" title="Active Queries">
        <ActiveQueryTab />
      </Tab>
    </Tabs>
  );
};

export default HomePage;
