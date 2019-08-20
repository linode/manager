import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { truncateAndJoinList } from 'src/utilities/stringUtils';
import { ManagedContactGroup } from './common';
import ActionMenu from './GroupsActionMenu';

interface Props {
  group: ManagedContactGroup;
  openDrawer: (groupName: string) => void;
}

export const GroupsRow: React.FunctionComponent<Props> = props => {
  const { group, openDrawer } = props;

  return (
    <TableRow key={group.groupName}>
      <TableCell parentColumn="Group Name">{group.groupName}</TableCell>
      <TableCell parentColumn="Contacts">
        {truncateAndJoinList(group.contactNames, 20)}
      </TableCell>
      <TableCell>
        <ActionMenu groupName={group.groupName} openDrawer={openDrawer} />
      </TableCell>
    </TableRow>
  );
};

export default GroupsRow;
