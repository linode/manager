import { Box, Checkbox, Notice, Typography } from '@linode/ui';
import { List, ListItem } from '@mui/material';
import * as React from 'react';

import { checkboxTestId, descriptionTestId, headerTestId } from './constants';

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
    <Box>
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
          checked={isEncryptEntityChecked}
          data-testid={checkboxTestId}
          disabled={disabled}
          onChange={(e, checked) => onChange(checked)}
          text={`Encrypt ${entityType ?? 'Disk'}`}
          toolTipText={disabled ? disabledReason : ''}
        />
      </Box>
    </Box>
  );
};
