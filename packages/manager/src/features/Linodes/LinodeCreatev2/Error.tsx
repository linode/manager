import { Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Error = () => {
  const {
    formState: { errors },
  } = useFormContext<CreateLinodeRequest>();
  const ref = useRef<HTMLDivElement>(null);

  const generalError = errors.root?.message ?? errors.interfaces?.message;

  useEffect(() => {
    if (generalError && ref.current) {
      ref.current.scrollIntoView({
        block: 'center',
      });
    }
  }, [generalError]);

  if (!generalError) {
    return null;
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Notice rootRef={ref} spacingBottom={0} spacingTop={0} variant="error">
        <Typography py={2}>{generalError}</Typography>
      </Notice>
    </Paper>
  );
};
