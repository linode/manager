import { useFlags as ldUseFlags } from 'launchdarkly-react-client-sdk';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { useFlags } from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import { getStorage, setStorage } from 'src/utilities/storage';

import type { FlagSet, Flags } from 'src/featureFlags';
import type { Dispatch } from 'src/hooks/types';

const MOCK_FEATURE_FLAGS_STORAGE_KEY = 'devTools/mock-feature-flags';

/**
 * Our flags can be either a boolean or a JSON object
 * In the case of JSON Objects, the `enabled` key will be used to control flag.
 * It is required to have the `enabled` key if using a JSON object for on/off featured flags.
 * This requirement is both documented here and in our Docs since we don't have a way to enforce types from Launch Darkly objects.
 */
const options: { flag: keyof Flags; label: string }[] = [
  { flag: 'aclp', label: 'CloudPulse' },
  { flag: 'apl', label: 'Application platform for LKE' },
  { flag: 'blockStorageEncryption', label: 'Block Storage Encryption (BSE)' },
  { flag: 'disableLargestGbPlans', label: 'Disable Largest GB Plans' },
  { flag: 'gecko2', label: 'Gecko' },
  { flag: 'imageServiceGen2', label: 'Image Service Gen2' },
  { flag: 'linodeDiskEncryption', label: 'Linode Disk Encryption (LDE)' },
  { flag: 'objMultiCluster', label: 'OBJ Multi-Cluster' },
  { flag: 'objectStorageGen2', label: 'OBJ Gen2' },
  { flag: 'selfServeBetas', label: 'Self Serve Betas' },
  { flag: 'supportTicketSeverity', label: 'Support Ticket Severity' },
  { flag: 'dbaasV2', label: 'Databases V2 Beta' },
  { flag: 'dbaasV2MonitorMetrics', label: 'Databases V2 Monitor' },
  { flag: 'databaseResize', label: 'Database Resize' },
  { flag: 'apicliDxToolsAdditions', label: 'APICLI DX Tools Additions' },
  { flag: 'apicliButtonCopy', label: 'APICLI Button Copy' },
];

const renderFlagItems = (
  flags: Partial<Flags>,
  onCheck: (e: React.ChangeEvent, flag: string) => void
) => {
  return options.map((option) => {
    const flagValue = flags[option.flag];
    const isChecked =
      typeof flagValue === 'object' && 'enabled' in flagValue
        ? Boolean(flagValue.enabled)
        : Boolean(flagValue);

    return (
      <li key={option.flag}>
        <input
          style={{
            marginRight: 12,
          }}
          checked={isChecked}
          onChange={(e) => onCheck(e, option.flag)}
          type="checkbox"
        />
        <span title={option.label}>{option.label}</span>
      </li>
    );
  });
};

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
      typeof currentFlag == 'object' && 'enabled' in currentFlag
        ? { ...currentFlag, enabled: e.target.checked } // If current flag is an object, update 'enabled' key
        : e.target.checked;
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
    <div className="dev-tools__tool">
      <div className="dev-tools__tool__header">
        <span title="Enable and disable Cloud Manager feature flags">
          Feature Flags
        </span>
      </div>
      <div className="dev-tools__tool__body">
        <div className="dev-tools__list-box">
          <ul>{renderFlagItems(flags, handleCheck)}</ul>
        </div>
      </div>
      <div className="dev-tools__tool__footer">
        <div className="dev-tools__button-list">
          <button onClick={resetFlags}>Reset to LD DEV Defaults</button>
        </div>
      </div>
    </div>
  );
});
