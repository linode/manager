import { TooltipIcon, Stack } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  index: number;
  linodeId: number;
  onRemove: () => void;
  range: string;
}

export const IPv6RangeRow = (props: Props) => {
  const { onRemove, range, index, linodeId } = props;

  const {
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const error =
    errors.public?.ipv6?.ranges?.[index]?.range?.message ??
    errors.public?.ipv6?.ranges?.[index]?.message;

  return (
    <TableRow key={range}>
      <TableCell>
        <Stack alignItems="center" direction="row" gap={1.5}>
          {range === '/56' || range === '/64' ? (
            <i>{range} range allocated on save</i>
          ) : (
            range
          )}
          {error && (
            <TooltipIcon
              status="error"
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
      <TableCell actionCell>
        <InlineMenuAction actionText="Remove" onClick={onRemove} />
      </TableCell>
    </TableRow>
  );
};
