import { ModifyLinodeInterfacePayload } from '@linode/api-v4';
import { Chip, Stack, TooltipIcon } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  address: string;
  index: number;
  onRemove: () => void;
  primary: boolean;
}

export const IPv4AddressRow = (props: Props) => {
  const { address, onRemove, index } = props;

  const { control, setValue, getValues, formState: {errors} } =
    useFormContext<ModifyLinodeInterfacePayload>();

  const primary = useWatch({
    control,
    name: `public.ipv4.addresses.${index}.primary`,
  });

  const onMakePrimary = () => {
    const values = getValues();

    for (let i = 0; i < (values.public?.ipv4?.addresses?.length ?? 0); i++) {
      setValue(`public.ipv4.addresses.${i}.primary`, i === index, {
        shouldDirty: true,
      });
    }
  };

  const error = errors.public?.ipv4?.addresses?.[index]?.message

  return (
    <TableRow key={address}>
      <TableCell>
        <Stack alignItems="center" direction="row" gap={1.5}>
          {address === 'auto' ? 'Allocate on Save' : address}
          {primary && <Chip color="primary" label="Primary" />}
          {error && <TooltipIcon status="error" text={error} />}
        </Stack>
      </TableCell>
      <TableCell actionCell noWrap>
        {!primary && (
          <InlineMenuAction
            actionText="Make Primary"
            disabled={primary}
            onClick={onMakePrimary}
          />
        )}
        <InlineMenuAction actionText="Remove" onClick={onRemove} />
      </TableCell>
    </TableRow>
  );
};
