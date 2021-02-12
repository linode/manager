import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import SelectableTableRow from 'src/components/SelectableTableRow';
import TableCell from 'src/components/TableCell/TableCell';
import { dcDisplayNames } from 'src/constants';
import { linodeFactory } from 'src/factories/linodes';
import { useTypes } from 'src/hooks/useTypes';
import { Entity, TransferEntity } from './transferReducer';
import TransferTable from './TransferTable';

interface Props {
  selectedLinodes: TransferEntity;
  handleSelect: (linodes: Entity[]) => void;
  handleRemove: (linodesToRemove: string[]) => void;
  handleToggle: (linode: Entity) => void;
}

const linodes = linodeFactory.buildList(25);

export const LinodeTransferTable: React.FC<Props> = props => {
  const { handleRemove, handleSelect, handleToggle, selectedLinodes } = props;
  const hasSelectedAll = Object.keys(selectedLinodes).length === linodes.length;

  const toggleSelectAll = () => {
    if (hasSelectedAll) {
      handleRemove(linodes.map(l => String(l.id)));
    } else {
      handleSelect(linodes);
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
      requestPage={() => null}
    >
      {linodes.slice(0, 25).map(thisLinode => (
        <LinodeRow
          key={thisLinode.id}
          linode={thisLinode}
          isChecked={Boolean(selectedLinodes[thisLinode.id])}
          handleToggleCheck={() => handleToggle(thisLinode)}
        />
      ))}
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
