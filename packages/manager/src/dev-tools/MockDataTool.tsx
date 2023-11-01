import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ServiceWorkerTool } from './ServiceWorkerTool';
import { MockData, mockDataController } from './mockDataController';

const options: { key: keyof MockData; label: string }[] = [
  { key: 'linode', label: 'Linodes' },
  { key: 'nodeBalancer', label: 'NodeBalancers' },
  { key: 'domain', label: 'Domains' },
  { key: 'volume', label: 'Volumes' },
];

export const MockDataTool = () => {
  // Keep track of mockData state locally to this component, so it can be referenced during render.
  const [localMockData, setLocalMockData] = React.useState<MockData>(
    mockDataController.mockData
  );

  const handleInputChange = (key: keyof MockData, quantity: number) => {
    const newMockData: MockData = { [key]: { mocked: true, quantity } };
    mockDataController.updateMockData(newMockData);
  };

  React.useEffect(() => {
    // Subscribe to mockData changes so this components local copy can be updated.
    const token = mockDataController.subscribe((newMockData) => {
      setLocalMockData(newMockData);
    });
    return () => mockDataController.unsubscribe(token);
  }, []);

  // @todo: The MockData interface has a `template` field, which could be used to allow entry of
  // specific fields, like label, region, etc. (via <input /> or even JSON entry?)

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginBottom: 8, marginTop: 0 }}>Mock Data</h4>
      </Grid>
      <Grid xs={12}>
        {options.map((thisOption) => {
          return (
            <div key={thisOption.key} style={{ marginTop: 4 }}>
              <label style={{ marginRight: 4 }}>{thisOption.label}: </label>
              <input
                onChange={(e) =>
                  handleInputChange(thisOption.key, Number(e.target.value))
                }
                min="0"
                type="number"
                value={localMockData[thisOption.key]?.quantity ?? 0}
              />
            </div>
          );
        })}
      </Grid>
      <Grid xs={12}>
        <ServiceWorkerTool />
      </Grid>
    </Grid>
  );
};
