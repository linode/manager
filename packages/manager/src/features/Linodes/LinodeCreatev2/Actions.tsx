import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

export const Actions = () => {
  const { formState } = useFormContext<CreateLinodeRequest>();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        buttonType="primary"
        disabled={isLinodeCreateRestricted}
        loading={formState.isSubmitting}
        type="submit"
      >
        Create Linode
      </Button>
    </Box>
  );
};
