import { Typography } from '@mui/material';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Error = () => {
  const {
    formState: { errors },
  } = useFormContext<CreateLinodeRequest>();

  const generalError = errors.root?.message ?? errors.interfaces?.message;

  if (!generalError) {
    return null;
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Notice spacingBottom={0} spacingTop={0} variant="error">
        <Typography py={2}>{generalError}</Typography>
      </Notice>
    </Paper>
  );
};
