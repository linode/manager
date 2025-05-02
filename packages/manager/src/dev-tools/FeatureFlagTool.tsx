import { useFlags as ldUseFlags } from 'launchdarkly-react-client-sdk';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { useFlags } from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import { getStorage, setStorage } from 'src/utilities/storage';

import type { Flags, FlagSet } from 'src/featureFlags';
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
  { flag: 'aclpAlerting', label: 'CloudPulse Alerting' },
  { flag: 'aclpIntegration', label: 'ACLP Integration' },
  { flag: 'apl', label: 'Akamai App Platform' },
  { flag: 'blockStorageEncryption', label: 'Block Storage Encryption (BSE)' },
  { flag: 'disableLargestGbPlans', label: 'Disable Largest GB Plans' },
  { flag: 'gecko2', label: 'Gecko' },
  { flag: 'limitsEvolution', label: 'Limits Evolution' },
  { flag: 'linodeDiskEncryption', label: 'Linode Disk Encryption (LDE)' },
  { flag: 'linodeInterfaces', label: 'Linode Interfaces' },
  { flag: 'lkeEnterprise', label: 'LKE-Enterprise' },
  { flag: 'mtctt2025', label: 'MTC TT 2025' },
  { flag: 'nodebalancerVpc', label: 'NodeBalancer-VPC Integration' },
  { flag: 'objMultiCluster', label: 'OBJ Multi-Cluster' },
  { flag: 'objectStorageGen2', label: 'OBJ Gen2' },
  { flag: 'selfServeBetas', label: 'Self Serve Betas' },
  { flag: 'supportTicketSeverity', label: 'Support Ticket Severity' },
  { flag: 'dbaasV2', label: 'Databases V2 Beta' },
  { flag: 'dbaasV2MonitorMetrics', label: 'Databases V2 Monitor' },
  { flag: 'databaseResize', label: 'Database Resize' },
  { flag: 'databaseAdvancedConfig', label: 'Database Advanced Config' },
  { flag: 'apicliButtonCopy', label: 'APICLI Button Copy' },
  { flag: 'iam', label: 'Identity and Access Beta' },
  {
    flag: 'linodeCloneFirewall',
    label: 'Linode Clone Firewall',
  },
  {
    flag: 'vmHostMaintenance',
    label: 'VM Host Maintenance Policy',
  },
];

interface RenderFlagItemProps {
  label: string;
  onCheck: (e: React.ChangeEvent, flag: string) => void;
  path: string;
  searchTerm: string;
  value: boolean | object | string | undefined;
}

const renderFlagItem = ({
  label,
  onCheck,
  path = '',
  searchTerm,
  value,
}: RenderFlagItemProps) => {
  const isObject = typeof value === 'object' && value !== null;

  if (!isObject) {
    return (
      <label title={label}>
        <input
          checked={Boolean(value)}
          onChange={(e) => onCheck(e, path || label)}
          type="checkbox"
        />
        {label}
      </label>
    );
  }

  const sortedEntries = Object.entries(value).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <ul>
      <details>
        <summary>{label}</summary>
        {sortedEntries.map(([key, nestedValue], index) => (
          <li key={`${key}-${index}`}>
            {renderFlagItem({
              label: key,
              onCheck,
              path: path ? `${path}.${key}` : key,
              searchTerm,
              value: nestedValue,
            })}
          </li>
        ))}
      </details>
    </ul>
  );
};

const renderFlagItems = (
  flags: Partial<Flags>,
  onCheck: (e: React.ChangeEvent, flag: string) => void,
  searchTerm: string
) => {
  const sortedOptions = options.sort((a, b) => a.label.localeCompare(b.label));
  return sortedOptions.map((option) => {
    const flagValue = flags[option.flag];
    const isSearchMatch = option.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!isSearchMatch) {
      return null;
    }

    return (
      <li key={option.flag}>
        {renderFlagItem({
          label: option.label,
          onCheck,
          path: option.flag,
          searchTerm,
          value: flagValue,
        })}
      </li>
    );
  });
};

export const FeatureFlagTool = withFeatureFlagProvider(() => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();
  const ldFlags = ldUseFlags();
  const [searchTerm, setSearchTerm] = React.useState('');

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
    const updatedValue = e.target.checked;
    const storedFlags = getStorage(MOCK_FEATURE_FLAGS_STORAGE_KEY) || {};

    const flagParts = flag.split('.');
    const updatedFlags = { ...storedFlags };

    // If the flag is not a nested flag, update it directly
    if (flagParts.length === 1) {
      updatedFlags[flag] = updatedValue;
    } else {
      // If the flag is a nested flag, update the specific property that changed
      const [parentKey, childKey] = flagParts;
      const currentParentValue = ldFlags[parentKey];
      const existingValues = storedFlags[parentKey] || {};

      // Only update the specific property that changed
      updatedFlags[parentKey] = {
        ...currentParentValue, // Keep original LD values
        ...existingValues, // Apply any existing stored overrides
        [childKey]: updatedValue, // Apply the new change
      };
    }

    updateFlagStorage(updatedFlags);
  };

  const updateFlagStorage = (updatedFlags: object) => {
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
          <input
            onChange={handleSearch}
            placeholder="Search feature flags"
            style={{ margin: 12 }}
            type="text"
          />
          <ul>{renderFlagItems(flags, handleCheck, searchTerm)}</ul>
        </div>
      </div>
      <div className="dev-tools__tool__footer">
        <div className="dev-tools__button-list">
          <button className="dev-tools-button" onClick={resetFlags}>
            Reset to LD DEV Defaults
          </button>
        </div>
      </div>
    </div>
  );
});
