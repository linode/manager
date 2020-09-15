import * as React from 'react';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import Grid from 'src/components/core/Grid';
import { MockData, mockDataController } from './mockDataController';

const options: { label: string; key: keyof MockData }[] = [
  { label: 'Linodes', key: 'linode' }
];

const MockDataTool: React.FC<{}> = () => {
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
    const token = mockDataController.subscribe(newMockData => {
      setLocalMockData(newMockData);
    });
    return () => mockDataController.unsubscribe(token);
  }, []);

  // @todo: The MockData interface has a `template` field, which could be used to allow entry of
  // specific fields, like label, region, etc. (via <input /> or even JSON entry?)

  return (
    <Grid>
      <Grid item xs={12}>
        <h4>Mock Data</h4>
      </Grid>
      <Grid item xs={12}>
        {options.map(thisOption => {
          return (
            <div key={thisOption.key} style={{ marginTop: 4 }}>
              <label>{thisOption.label}: </label>
              <input
                style={{ marginLeft: 4 }}
                type="number"
                min="0"
                onChange={e =>
                  handleInputChange(thisOption.key, Number(e.target.value))
                }
                value={localMockData[thisOption.key]?.quantity ?? 0}
              />
            </div>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default withFeatureFlagProvider(MockDataTool);
