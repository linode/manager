import { Chip, Stack, TooltipIcon } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  address: string;
  index: number;
  linodeId: number;
  onRemove: () => void;
}

export const IPv4AddressRow = (props: Props) => {
  const { address, onRemove, index, linodeId } = props;

  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

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

  const error = errors.public?.ipv4?.addresses?.[index]?.message;

  return (
    <TableRow key={address}>
      <TableCell>
        <Stack alignItems="center" direction="row" gap={1.5}>
          {address === 'auto' ? <i>IP allocated on save</i> : address}
          {primary && <Chip color="primary" label="Primary" />}
          {error && (
            <TooltipIcon
              sxTooltipIcon={{ padding: 0 }}
              text={
                <ErrorMessage
                  entity={{ type: 'linode_id', id: linodeId }}
                  message={error}
                  supportLinkProps={{
                    title: 'Additional Public IPv4 Addresses',
                  }}
                />
              }
            />
          )}
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
