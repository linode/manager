import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

interface Props {
  error?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
  token: string;
  twoFactorConfirmed: boolean;
}

export const ConfirmToken = React.memo((props: Props) => {
  const {
    error,
    handleChange,
    onCancel,
    onSubmit,
    submitting,
    token,
    twoFactorConfirmed,
  } = props;

  return (
    <React.Fragment>
      <Typography data-qa-copy variant="body1">
        Please enter the token generated by your 2FA app:
      </Typography>
      <TextField
        data-qa-confirm-token
        errorText={error}
        label="Token"
        onChange={handleChange}
        value={token}
      />
      {twoFactorConfirmed && (
        <StyledWarningNotice
          text={
            'Confirming a new key will invalidate codes generated from any previous key.'
          }
          spacingBottom={8}
          spacingTop={16}
          variant="warning"
        />
      )}
      <Box display="flex" justifyContent="flex-end" style={{ gap: 16 }}>
        <Button buttonType="secondary" data-qa-cancel onClick={onCancel}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          data-qa-submit
          loading={submitting}
          onClick={onSubmit}
        >
          Confirm Token
        </Button>
      </Box>
    </React.Fragment>
  );
});

const StyledWarningNotice = styled(Notice, {
  label: 'StyledWarningNotice',
})(({ theme }) => ({
  marginLeft: '0 !important',
  marginTop: theme.spacing(2),
}));
