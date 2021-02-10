import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import TransferTable from './TransferTable';
import { makeStyles, Theme } from 'src/components/core/styles';
import SelectableTableRow from 'src/components/SelectableTableRow';
import { linodeFactory } from 'src/factories/linodes';
import { TransferableEntity, TransferEntity } from './transferReducer';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {}

export type CombinedProps = Props;
const linodes = linodeFactory.buildList(10);

export const LinodeTransferTable: React.FC<Props> = props => {
  return (
    <TransferTable
      toggleSelectAll={() => null}
      hasSelectedAll={false}
      headers={['Label', 'Plan', 'Region']}
      requestPage={() => null}
    >
      {linodes.map(thisLinode => (
        <LinodeRow
          key={thisLinode.id}
          linode={thisLinode}
          isChecked={false}
          handleToggleCheck={() => null}
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
