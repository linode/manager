import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SelectableTableRow from 'src/components/SelectableTableRow';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { useSpecificTypes } from 'src/queries/types';
import { Entity, TransferEntity } from './transferReducer';
import TransferTable from './TransferTable';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { usePagination } from 'src/hooks/usePagination';
import { useRegionsQuery } from 'src/queries/regions';
import { extendType } from 'src/utilities/extendType';

interface Props {
  selectedLinodes: TransferEntity;
  handleSelect: (linodes: Entity[]) => void;
  handleRemove: (linodesToRemove: string[]) => void;
  handleToggle: (linode: Entity) => void;
}

export const LinodeTransferTable = (props: Props) => {
  const { handleRemove, handleSelect, handleToggle, selectedLinodes } = props;
  const [searchText, setSearchText] = React.useState('');

  const pagination = usePagination();

  const { data, isError, isLoading, error, dataUpdatedAt } = useLinodesQuery(
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
      toggleSelectAll={toggleSelectAll}
      hasSelectedAll={hasSelectedAll}
      headers={columns}
      requestPage={pagination.handlePageChange}
      page={pagination.page}
      handleSearch={handleSearch}
      pageSize={pagination.pageSize}
      count={data?.results ?? 0}
    >
      <TableContentWrapper
        loading={isLoading}
        error={error ?? undefined}
        length={data?.results ?? 0}
        lastUpdated={dataUpdatedAt}
      >
        {linodesCurrentPage.map((thisLinode) => (
          <LinodeRow
            key={thisLinode.id}
            linode={thisLinode}
            isChecked={Boolean(selectedLinodes[thisLinode.id])}
            handleToggleCheck={() => handleToggle(thisLinode)}
          />
        ))}
      </TableContentWrapper>
    </TransferTable>
  );
};

interface RowProps {
  linode: Linode;
  isChecked: boolean;
  handleToggleCheck: () => void;
}

const LinodeRow: React.FC<RowProps> = (props) => {
  const { linode, isChecked, handleToggleCheck } = props;
  const typesQuery = useSpecificTypes(linode.type ? [linode.type] : []);
  const type = typesQuery[0]?.data ? extendType(typesQuery[0].data) : undefined;
  const displayType = type?.formattedLabel ?? linode.type;

  const { data: regions } = useRegionsQuery();
  const region = regions?.find((r) => r.id === linode.region);
  const displayRegion = region?.label ?? linode.region;
  return (
    <SelectableTableRow
      isChecked={isChecked}
      handleToggleCheck={handleToggleCheck}
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

export default React.memo(LinodeTransferTable);
