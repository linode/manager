import { Button, Stack } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
}

export const Actions = (props: Props) => {
  const { formState } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Stack alignItems="center" direction="row" justifyContent="flex-end">
      <Button
        buttonType="primary"
        disabled={props.disabled}
        loading={formState.isSubmitting}
        type="submit"
      >
        Rebuild Linode
      </Button>
    </Stack>
  );
};
