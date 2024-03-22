import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';

export const Summary = () => {
  const { formState } = useFormContext<CreateLinodeRequest>();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        buttonType="primary"
        loading={formState.isSubmitting}
        type="submit"
      >
        Create Linode
      </Button>
    </Box>
  );
};
