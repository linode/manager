import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './GroupsActionMenu';

interface Props {
  groupName: string;
  contacts: string[];
  openDrawer: (groupName: string) => void;
}

export const GroupsRow: React.FunctionComponent<Props> = props => {
  const { groupName, contacts, openDrawer } = props;

  return (
    <TableRow key={groupName}>
      <TableCell parentColumn="Group Name">{groupName}</TableCell>
      <TableCell parentColumn="Contacts">{contacts.join(', ')}</TableCell>
      <TableCell>
        <ActionMenu groupName={groupName} openDrawer={openDrawer} />
      </TableCell>
    </TableRow>
  );
};

export default GroupsRow;
