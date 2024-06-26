import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Typography } from 'src/components/Typography';
import { Notice } from '../Notice/Notice';

export interface DiskEncryptionProps {
  descriptionCopy: JSX.Element | string;
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  isEncryptDiskChecked: boolean;
  onChange: (checked: boolean) => void;
}

export const headerTestId = 'disk-encryption-header';
export const descriptionTestId = 'disk-encryption-description';
export const checkboxTestId = 'encrypt-disk-checkbox';

export const DiskEncryption = (props: DiskEncryptionProps) => {
  const {
    descriptionCopy,
    disabled,
    disabledReason,
    error,
    isEncryptDiskChecked,
    onChange,
  } = props;

  return (
    <>
      <Typography data-testid={headerTestId} variant="h3">
        Disk Encryption
      </Typography>
      {error && (
        <Notice spacingBottom={0} spacingTop={8} text={error} variant="error" />
      )}
      <Typography
        data-testid={descriptionTestId}
        sx={(theme) => ({ padding: `${theme.spacing()} 0` })}
      >
        {descriptionCopy}
      </Typography>
      <Box
        sx={{
          marginLeft: '4px',
        }}
        alignItems="center"
        display="flex"
        flexDirection="row"
      >
        <Checkbox
          checked={disabled ? false : isEncryptDiskChecked} // in Create flows, this will be defaulted to be checked. Otherwise, we will rely on the current encryption status for the initial value
          data-testid={checkboxTestId}
          disabled={disabled}
          onChange={(e, checked) => onChange(checked)}
          text="Encrypt Disk"
          toolTipText={disabled ? disabledReason : ''}
        />
      </Box>
    </>
  );
};
