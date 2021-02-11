import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import TransferTable from './TransferTable';
import { makeStyles, Theme } from 'src/components/core/styles';
import SelectableTableRow from 'src/components/SelectableTableRow';
import { linodeFactory } from 'src/factories/linodes';
import { Entity, TransferEntity } from './transferReducer';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  selectedLinodes: TransferEntity;
  handleSelect: (linodes: Entity[]) => void;
  handleRemove: (linodesToRemove: string[]) => void;
  handleToggle: (linode: Entity) => void;
}

const linodes = linodeFactory.buildList(10);

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
  return (
    <TransferTable
      toggleSelectAll={toggleSelectAll}
      hasSelectedAll={hasSelectedAll}
      headers={['Label', 'Plan', 'Region']}
      requestPage={() => null}
    >
      {linodes.map(thisLinode => (
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
  return (
    <SelectableTableRow
      isChecked={isChecked}
      handleToggleCheck={handleToggleCheck}
    >
      <TableCell>{linode.label}</TableCell>
      <TableCell>{linode.type}</TableCell>
      <TableCell>{linode.region}</TableCell>
    </SelectableTableRow>
  );
};

export default React.memo(LinodeTransferTable);
