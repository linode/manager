import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';

export const Summary = () => {
  const { formState } = useFormContext<CreateLinodeRequest>();

  return (
    <Paper sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        buttonType="primary"
        loading={formState.isSubmitting}
        type="submit"
      >
        Create Linode
      </Button>
    </Paper>
  );
};
