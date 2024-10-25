import { Notice } from '@linode/ui';
import { List, ListItem } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Typography } from 'src/components/Typography';

export interface EncryptionProps {
  descriptionCopy: JSX.Element | string;
  disabled?: boolean;
  disabledReason?: string;
  entityType?: string;
  error?: string;
  isEncryptEntityChecked: boolean;
  notices?: string[];
  onChange: (checked: boolean) => void;
}

export const headerTestId = 'encryption-header';
export const descriptionTestId = 'encryption-description';
export const checkboxTestId = 'encrypt-entity-checkbox';

export const Encryption = (props: EncryptionProps) => {
  const {
    descriptionCopy,
    disabled,
    disabledReason,
    entityType,
    error,
    isEncryptEntityChecked,
    notices,
    onChange,
  } = props;

  return (
    <>
      <Typography data-testid={headerTestId} variant="h3">
        {`${entityType ?? 'Disk'} Encryption`}
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
      {notices && notices.length > 0 && (
        <Notice marginTop="0.875rem" spacingBottom={4} variant="warning">
          <List
            sx={(theme) => ({
              '& > li': {
                display: notices.length > 1 ? 'list-item' : 'inline',
                fontSize: '0.875rem',
                lineHeight: theme.spacing(2),
                padding: 0,
                pl: 0,
                py: 0.5,
              },
              listStyle: 'disc',
              ml: notices.length > 1 ? theme.spacing(2) : 0,
            })}
          >
            {notices.map((notice, i) => (
              <ListItem key={i}>{notice}</ListItem>
            ))}
          </List>
        </Notice>
      )}
      <Box
        sx={{
          marginLeft: '4px',
        }}
        alignItems="center"
        display="flex"
        flexDirection="row"
      >
        <Checkbox
          checked={disabled ? false : isEncryptEntityChecked} // in Create flows, this will be defaulted to be checked. Otherwise, we will rely on the current encryption status for the initial value
          data-testid={checkboxTestId}
          disabled={disabled}
          onChange={(e, checked) => onChange(checked)}
          text={`Encrypt ${entityType ?? 'Disk'}`}
          toolTipText={disabled ? disabledReason : ''}
        />
      </Box>
    </>
  );
};
