import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Typography } from 'src/components/Typography';

export interface DiskEncryptionProps {
  descriptionCopy: JSX.Element | string;
  disabled?: boolean;
  disabledReason?: string;
  // encryptionStatus
  // toggleEncryption
}

export const headerTestId = 'disk-encryption-header';
export const descriptionTestId = 'disk-encryption-description';
export const checkboxTestId = 'encrypt-disk-checkbox';

export const DiskEncryption = (props: DiskEncryptionProps) => {
  const { descriptionCopy, disabled, disabledReason } = props;

  const [checked, setChecked] = React.useState<boolean>(false); // @TODO LDE: temporary placeholder until toggleEncryption logic is in place

  return (
    <>
      <Typography data-testid={headerTestId} variant="h3">
        Disk Encryption
      </Typography>
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
          checked={checked} // @TODO LDE: in Create flows, this will be defaulted to be checked. Otherwise, we will rely on the current encryption status for the initial value
          data-testid={checkboxTestId}
          disabled={disabled}
          onChange={() => setChecked(!checked)} // @TODO LDE: toggleEncryption will be used here
          text="Encrypt Disk"
          toolTipText={disabled ? disabledReason : ''}
        />
      </Box>
    </>
  );
};
