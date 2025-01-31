import { Button, Stack } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { RebuildLinodeFormValues } from './utils';

export const Actions = () => {
  const { formState } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Stack alignItems="center" direction="row" justifyContent="flex-end">
      <Button
        buttonType="primary"
        loading={formState.isSubmitting}
        type="submit"
      >
        Rebuild Linode
      </Button>
    </Stack>
  );
};
