import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import {
  DISK_ENCRYPTION_GENERAL_DESCRIPTION,
  DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY,
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
  isOptional?: boolean;
  label?: string;
  password: null | string;
  passwordHelperText?: string;
  placeholder?: string;
  required?: boolean;
  selectedRegion?: string;
  setAuthorizedUsers?: (usernames: string[]) => void;
  small?: boolean;
  toggleDiskEncryptionEnabled?: () => void;
  tooltipInteractive?: boolean;
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
    isOptional,
    label,
    password,
    passwordHelperText,
    placeholder,
    required,
    selectedRegion,
    setAuthorizedUsers,
    toggleDiskEncryptionEnabled,
    tooltipInteractive,
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
          descriptionCopy={DISK_ENCRYPTION_GENERAL_DESCRIPTION}
          disabled={!regionSupportsDiskEncryption}
          disabledReason={DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY}
          isEncryptDiskChecked={diskEncryptionEnabled ?? false}
          toggleDiskEncryptionEnabled={toggleDiskEncryptionEnabled}
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
          tooltipInteractive={tooltipInteractive}
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
