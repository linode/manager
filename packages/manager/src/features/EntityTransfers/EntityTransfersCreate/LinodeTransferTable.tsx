import {
  useLinodesQuery,
  useRegionsQuery,
  useSpecificTypes,
} from '@linode/queries';
import { Hidden } from '@linode/ui';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { SelectableTableRow } from 'src/components/SelectableTableRow/SelectableTableRow';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { useFlags } from 'src/hooks/useFlags';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { extendType } from 'src/utilities/extendType';

import { TransferTable } from './TransferTable';

import type { Entity, TransferEntity } from './transferReducer';
import type { Linode } from '@linode/api-v4/lib/linodes';
import type { Theme } from '@mui/material/styles';

interface Props {
  disabled: boolean;
  handleRemove: (linodesToRemove: string[]) => void;
  handleSelect: (linodes: Entity[]) => void;
  handleToggle: (linode: Entity) => void;
  selectedLinodes: TransferEntity;
}

export const LinodeTransferTable = React.memo((props: Props) => {
  const {
    handleRemove,
    handleSelect,
    handleToggle,
    selectedLinodes,
    disabled,
  } = props;
  const flags = useFlags();

  const [searchText, setSearchText] = React.useState('');

  const pagination = usePaginationV2({
    currentRoute: flags?.iamRbacPrimaryNavChanges
      ? '/service-transfers/create'
      : '/account/service-transfers/create',
    initialPage: 1,
    preferenceKey: 'linode-transfer-table',
  });

  const { data, dataUpdatedAt, error, isError, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    generateLinodeXFilter(searchText)
  );

  const linodesCurrentPage = data?.data ?? [];

  const hasSelectedAll =
    linodesCurrentPage.every((thisLinode) =>
      Boolean(selectedLinodes[thisLinode.id])
    ) &&
    !isLoading &&
    !isError &&
    Object.keys(selectedLinodes).length > 0;

  const toggleSelectAll = () => {
    if (hasSelectedAll) {
      handleRemove(linodesCurrentPage.map((l) => String(l.id)));
    } else {
      handleSelect(linodesCurrentPage);
    }
  };

  const handleSearch = (searchText: string) => {
    setSearchText(searchText);
    // If you're on page 2+, need to go back to page 1 to see the actual results
    pagination.handlePageChange(1);
  };

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('lg'));
  const columns = matchesSmDown
    ? ['Label', 'Plan']
    : ['Label', 'Plan', 'Region'];

  return (
    <TransferTable
      count={data?.results ?? 0}
      disabled={disabled}
      handleSearch={handleSearch}
      hasSelectedAll={hasSelectedAll}
      headers={columns}
      page={pagination.page}
      pageSize={pagination.pageSize}
      requestPage={pagination.handlePageChange}
      searchText={searchText}
      toggleSelectAll={toggleSelectAll}
    >
      <TableContentWrapper
        error={error ?? undefined}
        lastUpdated={dataUpdatedAt}
        length={data?.results ?? 0}
        loading={isLoading}
        loadingProps={{ columns: columns.length + 1 }}
      >
        {linodesCurrentPage.map((thisLinode) => (
          <LinodeRow
            disabled={disabled}
            handleToggleCheck={() => handleToggle(thisLinode)}
            isChecked={Boolean(selectedLinodes[thisLinode.id])}
            key={thisLinode.id}
            linode={thisLinode}
          />
        ))}
      </TableContentWrapper>
    </TransferTable>
  );
});

interface RowProps {
  disabled?: boolean;
  handleToggleCheck: () => void;
  isChecked: boolean;
  linode: Linode;
}

const LinodeRow = (props: RowProps) => {
  const { handleToggleCheck, isChecked, linode, disabled } = props;
  const typesQuery = useSpecificTypes(linode.type ? [linode.type] : []);
  const type = typesQuery[0]?.data ? extendType(typesQuery[0].data) : undefined;
  const displayType = type?.formattedLabel ?? linode.type;

  const { data: regions } = useRegionsQuery();
  const region = regions?.find((r) => r.id === linode.region);
  const displayRegion = region?.label ?? linode.region;
  return (
    <SelectableTableRow
      className={disabled ? 'disabled-row' : ''}
      disabled={disabled}
      handleToggleCheck={handleToggleCheck}
      isChecked={isChecked}
    >
      <TableCell>{linode.label}</TableCell>
      <TableCell>{displayType}</TableCell>
      <Hidden lgDown>
        <TableCell>{displayRegion}</TableCell>
      </Hidden>
    </SelectableTableRow>
  );
};

export const generateLinodeXFilter = (searchText: string) => {
  if (searchText === '') {
    return {};
  }

  return {
    label: { '+contains': searchText },
  };
};
