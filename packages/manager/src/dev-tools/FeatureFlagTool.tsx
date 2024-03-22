import Grid from '@mui/material/Unstable_Grid2';
import { useFlags as ldUseFlags } from 'launchdarkly-react-client-sdk';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { FlagSet, Flags } from 'src/featureFlags';
import { Dispatch } from 'src/hooks/types';
import { useFlags } from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import { getStorage, setStorage } from 'src/utilities/storage';
const MOCK_FEATURE_FLAGS_STORAGE_KEY = 'devTools/mock-feature-flags';

/**
 * Our flags can be either a boolean or a JSON object
 * In the case of JSON Objects, the `enabled` key will be used to control flag.
 * It is required to have the `enabled` key if using a JSON object for on/off featured flags.
 * This requirement is both documented here and in our Docs since we don't have a way to enforce types from Launch Darkly objects.
 */
const options: { flag: keyof Flags; label: string }[] = [
  { flag: 'aclb', label: 'ACLB' },
  { flag: 'aclbFullCreateFlow', label: 'ACLB Full Create Flow' },
  { flag: 'disableLargestGbPlans', label: 'Disable Largest GB Plans' },
  { flag: 'linodeCloneUiChanges', label: 'Linode Clone UI Changes' },
  { flag: 'gecko', label: 'Gecko' },
  { flag: 'parentChildAccountAccess', label: 'Parent/Child Account' },
  { flag: 'selfServeBetas', label: 'Self Serve Betas' },
  { flag: 'vpc', label: 'VPC' },
  { flag: 'firewallNodebalancer', label: 'Firewall NodeBalancer' },
  { flag: 'recharts', label: 'Recharts' },
  { flag: 'objMultiCluster', label: 'OBJ Multi-Cluster' },
  { flag: 'placementGroups', label: 'Placement Groups' },
  { flag: 'linodeCreateRefactor', label: 'Linode Create v2' },
];

export const FeatureFlagTool = withFeatureFlagProvider(() => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();
  const ldFlags = ldUseFlags();

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
    const currentFlag = flags[flag];
    const updatedValue =
      typeof currentFlag === 'boolean'
        ? e.target.checked
        : { ...currentFlag, enabled: e.target.checked }; // If current flag is an object, update 'enabled' key
    const updatedFlags = {
      ...getStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY),
      [flag]: updatedValue,
    };
    dispatch(setMockFeatureFlags(updatedFlags));
    setStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(updatedFlags));
  };

  /**
   * This will reset the flags values to the Launch Darkly defaults (as returned from the LD dev environment)
   */
  const resetFlags = () => {
    dispatch(setMockFeatureFlags(ldFlags));
    setStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY, '');
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginBottom: 8, marginTop: 0 }}>Feature Flags</h4>
      </Grid>
      <Grid xs={12}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {options.map((thisOption) => {
            const flagValue = flags[thisOption.flag];
            const isChecked =
              typeof flagValue === 'object' && 'enabled' in flagValue
                ? Boolean(flagValue.enabled)
                : Boolean(flagValue);
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
                  checked={isChecked}
                  onChange={(e) => handleCheck(e, thisOption.flag)}
                  type="checkbox"
                />
              </div>
            );
          })}
          <button onClick={resetFlags} style={{ marginTop: 8 }}>
            Reset to LD default flags
          </button>
        </div>
      </Grid>
    </Grid>
  );
});
