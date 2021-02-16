import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import SelectableTableRow from 'src/components/SelectableTableRow';
import TableCell from 'src/components/TableCell/TableCell';
import { dcDisplayNames } from 'src/constants';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { useTypes } from 'src/hooks/useTypes';
import { Entity, TransferEntity } from './transferReducer';
import TransferTable from './TransferTable';
import { useLinodesQuery } from 'src/queries/linodes';
import { usePagination } from 'src/hooks/usePagination';

interface Props {
  selectedLinodes: TransferEntity;
  handleSelect: (linodes: Entity[]) => void;
  handleRemove: (linodesToRemove: string[]) => void;
  handleToggle: (linode: Entity) => void;
}

export const LinodeTransferTable: React.FC<Props> = props => {
  const { handleRemove, handleSelect, handleToggle, selectedLinodes } = props;

  const pagination = usePagination();

  const { data, isError, isLoading, error, dataUpdatedAt } = useLinodesQuery({
    page: pagination.page,
    page_size: pagination.pageSize
  });

  const linodesCurrentPage = Object.values(data?.linodes ?? {});
  const hasSelectedAll =
    linodesCurrentPage.every(thisLinode =>
      Boolean(selectedLinodes[thisLinode.id])
    ) &&
    !isLoading &&
    !isError;

  const toggleSelectAll = () => {
    if (hasSelectedAll) {
      handleRemove(linodesCurrentPage.map(l => String(l.id)));
    } else {
      handleSelect(linodesCurrentPage);
    }
  };

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
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
      pageSize={pagination.pageSize}
      count={data?.results ?? 0}
    >
      <TableContentWrapper
        loading={isLoading}
        error={error ?? undefined}
        length={data?.results ?? 0}
        lastUpdated={dataUpdatedAt}
      >
        {linodesCurrentPage.map(thisLinode => (
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

const LinodeRow: React.FC<RowProps> = props => {
  const { linode, isChecked, handleToggleCheck } = props;
  const { typesMap } = useTypes();
  const displayRegion = dcDisplayNames[linode.region] ?? linode.region;
  const displayType = typesMap[linode.type ?? '']?.label ?? linode.type;
  return (
    <SelectableTableRow
      isChecked={isChecked}
      handleToggleCheck={handleToggleCheck}
    >
      <TableCell>{linode.label}</TableCell>
      <TableCell>{displayType}</TableCell>
      <Hidden smDown>
        <TableCell>{displayRegion}</TableCell>
      </Hidden>
    </SelectableTableRow>
  );
};

export default React.memo(LinodeTransferTable);
