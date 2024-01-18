import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { FlagSet, Flags } from 'src/featureFlags';
import { Dispatch } from 'src/hooks/types';
import { useFlags } from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import { getStorage, setStorage } from 'src/utilities/storage';

const MOCK_FEATURE_FLAGS_STORAGE_KEY = 'devTools/mock-feature-flags';

const options: { flag: keyof Flags; label: string }[] = [
  { flag: 'aglb', label: 'AGLB' },
  { flag: 'aglbFullCreateFlow', label: 'AGLB Full Create Flow' },
  { flag: 'dcGetWell', label: 'DC Get Well' },
  { flag: 'metadata', label: 'Metadata' },
  { flag: 'parentChildAccountAccess', label: 'Parent/Child Account' },
  { flag: 'selfServeBetas', label: 'Self Serve Betas' },
  { flag: 'vpc', label: 'VPC' },
  { flag: 'firewallNodebalancer', label: 'Firewall NodeBalancer' },
  { flag: 'recharts', label: 'Recharts' },
  { flag: 'objMultiCluster', label: 'OBJ Multi-Cluster' },
  { flag: 'vmPlacement', label: 'Placement Groups' },
];

export const FeatureFlagTool = withFeatureFlagProvider(() => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();

  React.useEffect(() => {
    const storedFlags = getStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY);
    if (storedFlags) {
      dispatch(setMockFeatureFlags(storedFlags));
    }
  }, [dispatch]);

  const handleCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    flag: keyof FlagSet
  ) => {
    dispatch(setMockFeatureFlags({ [flag]: e.target.checked }));
    const updatedFlags = JSON.stringify({
      ...getStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY),
      [flag]: e.target.checked,
    });
    setStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY, updatedFlags);
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginBottom: 8, marginTop: 0 }}>Feature Flags</h4>
      </Grid>
      <Grid xs={12}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {options.map((thisOption) => {
            return (
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                key={thisOption.flag}
              >
                <span>{thisOption.label} </span>
                <input
                  checked={Boolean(flags[thisOption.flag])}
                  onChange={(e) => handleCheck(e, thisOption.flag)}
                  type="checkbox"
                />
              </div>
            );
          })}
        </div>
      </Grid>
    </Grid>
  );
});
