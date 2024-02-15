import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { OrderByProps } from 'src/components/OrderBy';
import { Radio } from 'src/components/Radio/Radio';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell, TableCellProps } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useImageQuery } from 'src/queries/images';
import {
  queryKey as linodesQueryKey,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { RegionIndicator } from '../../LinodesLanding/RegionIndicator';

interface Props {
  disabled?: boolean;
  handlePowerOff: () => void;
  handleSelection: () => void;
  linodeId: number;
  selected: boolean;
}

export const SelectLinodeRow = (props: Props) => {
  const queryClient = useQueryClient();
  const {
    disabled,
    handlePowerOff,
    handleSelection,
    linodeId,
    selected,
  } = props;

  const theme = useTheme();

  const {
    data: linode,
    error: linodeError,
    isLoading: linodeLoading,
  } = useLinodeQuery(linodeId);

  const { data: linodeType } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { data: linodeImage } = useImageQuery(
    linode?.image ?? '',
    Boolean(linode?.image)
  );

  // If the Linode's status is running, we want to check if its interfaces associated with this subnet have become active so
  // that we can determine if it needs a reboot or not. So, we need to invalidate the linode configs query to get the most up to date information.
  React.useEffect(() => {
    if (linode && linode.status === 'running') {
      queryClient.invalidateQueries([
        linodesQueryKey,
        'linode',
        linodeId,
        'configs',
      ]);
    }
  }, [linode, linodeId, queryClient]);

  if (linodeLoading || !linode) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
          <CircleProgress mini />
        </TableCell>
      </TableRow>
    );
  }

  if (linodeError) {
    return (
      <TableRow data-testid="subnet-linode-row-error">
        <TableCell colSpan={5} style={{ paddingLeft: 24 }}>
          <Box alignItems="center" display="flex">
            <ErrorOutline
              data-qa-error-icon
              sx={(theme) => ({ color: theme.color.red, marginRight: 1 })}
            />
            <Typography>
              There was an error loading{' '}
              <Link to={`/linodes/${linodeId}`}>Linode {linodeId}</Link>
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  const iconStatus = getLinodeIconStatus(linode.status);
  const isRunning = linode.status == 'running';

  return (
    <TableRow onClick={handleSelection}>
      <TableCell
        component="th"
        scope="row"
        sx={{ height: theme.spacing(6), padding: '0 !important', width: '3%' }}
      >
        <Radio checked={selected} disabled={disabled} />
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
      <TableCell actionCell>
        {isRunning && (
          <InlineMenuAction
            actionText="Power Off"
            buttonHeight={47}
            onClick={handlePowerOff}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export const SelectLinodeTableRowHead = (props: {
  orderBy: Omit<OrderByProps<{}>, 'data'>;
}) => {
  const { orderBy } = props;
  const CustomSortCell = (
    props: TableCellProps & {
      label: string;
    }
  ) => (
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
      <TableCell />
    </TableRow>
  );
};
