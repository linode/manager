import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import {
  DISK_ENCRYPTION_GENERAL_DESCRIPTION,
  DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY,
  ENCRYPT_DISK_DISABLED_REBUILD_DISTRIBUTED_REGION_REASON,
  ENCRYPT_DISK_DISABLED_REBUILD_LKE_REASON,
} from 'src/components/DiskEncryption/constants';
import { DiskEncryption } from 'src/components/DiskEncryption/DiskEncryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { Paper } from 'src/components/Paper';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';

import { Divider } from '../Divider';
import UserSSHKeyPanel from './UserSSHKeyPanel';

import type { Theme } from '@mui/material/styles';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
);

const useStyles = makeStyles<void, 'passwordInputOuter'>()(
  (theme: Theme, _params, classes) => ({
    isOptional: {
      [`& .${classes.passwordInputOuter}`]: {
        marginTop: 0,
      },
    },
    passwordInputOuter: {},
    root: {
      marginTop: theme.spacing(3),
    },
  })
);

interface Props {
  authorizedUsers?: string[];
  className?: string;
  disabled?: boolean;
  disabledReason?: JSX.Element | string;
  diskEncryptionEnabled?: boolean;
  displayDiskEncryption?: boolean;
  error?: string;
  handleChange: (value: string) => void;
  heading?: string;
  hideStrengthLabel?: boolean;
  isLKELinode?: boolean;
  isOptional?: boolean;
  label?: string;
  linodeIsInDistributedRegion?: boolean;
  password: null | string;
  passwordHelperText?: string;
  placeholder?: string;
  required?: boolean;
  selectedRegion?: string;
  setAuthorizedUsers?: (usernames: string[]) => void;
  small?: boolean;
  toggleDiskEncryptionEnabled?: () => void;
}

export const AccessPanel = (props: Props) => {
  const {
    authorizedUsers,
    className,
    disabled,
    disabledReason,
    diskEncryptionEnabled,
    displayDiskEncryption,
    error,
    handleChange: _handleChange,
    hideStrengthLabel,
    isLKELinode,
    isOptional,
    label,
    linodeIsInDistributedRegion,
    password,
    passwordHelperText,
    placeholder,
    required,
    selectedRegion,
    setAuthorizedUsers,
    toggleDiskEncryptionEnabled,
  } = props;

  const { classes, cx } = useStyles();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const regions = useRegionsQuery().data ?? [];

  const regionSupportsDiskEncryption = doesRegionSupportFeature(
    selectedRegion ?? '',
    regions,
    'Disk Encryption'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    _handleChange(e.target.value);

  const determineEncryptDiskDisabledReason = ({
    isLKELinode,
    linodeIsInDistributedRegion,
    regionSupportsDiskEncryption,
  }: {
    isLKELinode: boolean | undefined;
    linodeIsInDistributedRegion: boolean | undefined;
    regionSupportsDiskEncryption: boolean;
  }) => {
    if (isLKELinode) {
      return ENCRYPT_DISK_DISABLED_REBUILD_LKE_REASON;
    }

    if (linodeIsInDistributedRegion) {
      return ENCRYPT_DISK_DISABLED_REBUILD_DISTRIBUTED_REGION_REASON;
    }

    if (!regionSupportsDiskEncryption) {
      return DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY;
    }

    return '';
  };

  /**
   * Display the "Disk Encryption" section if:
   * 1) the feature is enabled
   * 2) "displayDiskEncryption" is explicitly passed -- <AccessPanel />
   * gets used in several places, but we don't want to display Disk Encryption in all
   * 3) toggleDiskEncryptionEnabled is defined
   */
  const diskEncryptionJSX =
    isDiskEncryptionFeatureEnabled &&
    displayDiskEncryption &&
    toggleDiskEncryptionEnabled !== undefined ? (
      <>
        <Divider spacingBottom={20} spacingTop={24} />
        <DiskEncryption
          disabled={
            !regionSupportsDiskEncryption ||
            isLKELinode ||
            linodeIsInDistributedRegion
          }
          disabledReason={determineEncryptDiskDisabledReason({
            isLKELinode,
            linodeIsInDistributedRegion,
            regionSupportsDiskEncryption,
          })}
          descriptionCopy={DISK_ENCRYPTION_GENERAL_DESCRIPTION}
          isEncryptDiskChecked={diskEncryptionEnabled ?? false}
          onChange={() => toggleDiskEncryptionEnabled()}
        />
      </>
    ) : null;

  return (
    <Paper
      className={cx(
        {
          [classes.isOptional]: isOptional,
        },
        classes.root,
        className
      )}
    >
      {isDiskEncryptionFeatureEnabled && (
        <Typography
          sx={(theme) => ({ paddingBottom: theme.spacing(2) })}
          variant="h2"
        >
          Security
        </Typography>
      )}
      <React.Suspense fallback={<SuspenseLoader />}>
        <PasswordInput
          autoComplete="off"
          className={classes.passwordInputOuter}
          data-qa-password-input
          disabled={disabled}
          disabledReason={disabledReason || ''}
          errorText={error}
          helperText={passwordHelperText}
          hideStrengthLabel={hideStrengthLabel}
          label={label || 'Root Password'}
          name="password"
          noMarginTop
          onChange={handleChange}
          placeholder={placeholder || 'Enter a password.'}
          required={required}
          value={password || ''}
        />
      </React.Suspense>
      {setAuthorizedUsers !== undefined && authorizedUsers !== undefined ? (
        <>
          <Divider spacingBottom={20} spacingTop={24} />
          <UserSSHKeyPanel
            authorizedUsers={authorizedUsers}
            disabled={disabled}
            setAuthorizedUsers={setAuthorizedUsers}
          />
        </>
      ) : null}
      {diskEncryptionJSX}
    </Paper>
  );
};
