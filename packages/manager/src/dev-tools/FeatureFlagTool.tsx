import * as React from 'react';
import { useDispatch } from 'react-redux';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { Flags, FlagSet } from 'src/featureFlags';
import { Dispatch } from 'src/hooks/types';
import useFlags from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import Grid from 'src/components/core/Grid';

const options: { label: string; flag: keyof Flags }[] = [
  { label: 'Databases', flag: 'databases' },
  { label: 'Bare Metal', flag: 'bareMetal' },
  { label: 'Machine Images', flag: 'machineImages' },
];

const FeatureFlagTool: React.FC<{}> = () => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();

  const handleCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    flag: keyof FlagSet
  ) => {
    dispatch(setMockFeatureFlags({ [flag]: e.target.checked }));
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <h4 style={{ marginBottom: 8 }}>Feature Flags</h4>
      </Grid>
      <Grid item xs={12}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {options.map((thisOption) => {
            return (
              <div
                key={thisOption.flag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}
              >
                <span>{thisOption.label} </span>
                <input
                  type="checkbox"
                  checked={Boolean(flags[thisOption.flag])}
                  onChange={(e) => handleCheck(e, thisOption.flag)}
                />
              </div>
            );
          })}
        </div>
      </Grid>
    </Grid>
  );
};

export default withFeatureFlagProvider(FeatureFlagTool);
