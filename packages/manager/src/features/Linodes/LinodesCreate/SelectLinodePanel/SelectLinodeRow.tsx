import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { OrderByProps } from 'src/components/OrderBy';
import { Radio } from 'src/components/Radio/Radio';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell, TableCellProps } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useImageQuery } from 'src/queries/images';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { RegionIndicator } from '../../LinodesLanding/RegionIndicator';

import type { Linode } from '@linode/api-v4/lib/linodes/types';

interface Props {
  disabled?: boolean;
  handlePowerOff: () => void;
  handleSelection: () => void;
  linode: Linode;
  selected: boolean;
  showPowerActions: boolean;
}

export const SelectLinodeRow = (props: Props) => {
  const queryClient = useQueryClient();
  const {
    disabled,
    handlePowerOff,
    handleSelection,
    linode,
    selected,
    showPowerActions,
  } = props;

  const theme = useTheme();

  const { data: linodeType } = useTypeQuery(
    linode.type ?? '',
    Boolean(linode.type)
  );

  const { data: linodeImage } = useImageQuery(
    linode.image ?? '',
    Boolean(linode.image)
  );

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linode.id,
  });

  const isDisabled = disabled || isLinodesGrantReadOnly;

  // If the Linode's status is running, we want to check if its interfaces associated with this subnet have become active so
  // that we can determine if it needs a reboot or not. So, we need to invalidate the linode configs query to get the most up to date information.
  React.useEffect(() => {
    if (linode && linode.status === 'running') {
      queryClient.invalidateQueries([
        linodesQueryKey,
        'linode',
        linode.id,
        'configs',
      ]);
    }
  }, [linode, queryClient]);

  const iconStatus = getLinodeIconStatus(linode.status);
  const isRunning = linode.status == 'running';

  return (
    <TableRow
      disabled={isDisabled}
      onClick={isDisabled ? undefined : handleSelection}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ height: theme.spacing(6), padding: '0 !important', width: '3%' }}
      >
        <Radio checked={!isDisabled && selected} disabled={isDisabled} />
      </TableCell>
      <TableCell>{linode.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon
          aria-label={`Linode status ${linode?.status ?? iconStatus}`}
          status={iconStatus}
        />
        {capitalizeAllWords(linode.status.replace('_', ' '))}
      </TableCell>
      <TableCell>{linodeImage?.label ?? linode.image ?? 'Unknown'}</TableCell>
      <TableCell>
        {linodeType ? formatStorageUnits(linodeType?.label) : linode.type}
      </TableCell>
      <TableCell>
        <RegionIndicator region={linode.region} />
      </TableCell>
      {showPowerActions && (
        <TableCell actionCell>
          {isRunning && selected && (
            <InlineMenuAction
              actionText="Power Off"
              buttonHeight={47}
              disabled={isDisabled}
              onClick={handlePowerOff}
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

// Keep up to date with number of columns
export const numCols = 7;

interface CustomSortCellProps extends TableCellProps {
  label: string;
}

export const SelectLinodeTableRowHead = (props: {
  orderBy: Omit<OrderByProps<{}>, 'data'>;
  showPowerActions: boolean;
}) => {
  const { orderBy, showPowerActions } = props;
  const CustomSortCell = (props: CustomSortCellProps) => (
    <TableSortCell
      active={props.label == orderBy.orderBy}
      direction={orderBy.order}
      handleClick={orderBy.handleOrderChange}
      {...props}
    />
  );

  return (
    <TableRow>
      <TableCell sx={{ borderRight: 'none !important', width: '2%' }} />
      <CustomSortCell
        label="label"
        sx={{ borderLeft: 'none !important', paddingLeft: '4em', width: '20%' }}
      >
        Linode
      </CustomSortCell>
      <CustomSortCell label="status" sx={{ width: '12%' }}>
        Status
      </CustomSortCell>
      <CustomSortCell label="image" sx={{ width: '13%' }}>
        Image
      </CustomSortCell>
      <CustomSortCell label="plan" sx={{ width: '13%' }}>
        Plan
      </CustomSortCell>
      <CustomSortCell label="region" sx={{ width: '13%' }}>
        Region
      </CustomSortCell>
      {showPowerActions && <TableCell />}
    </TableRow>
  );
};
