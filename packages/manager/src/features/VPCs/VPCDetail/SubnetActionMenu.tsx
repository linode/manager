/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

export const SubnetsActionMenu = ({}) => {
  const handleAssignLinode = () => {};

  const handleUnassignLinode = () => {};

  const handleEdit = () => {};

  const handleDelete = () => {};

  const actions: Action[] = [
    {
      onClick: () => {
        handleAssignLinode();
      },
      title: 'Assign Linode',
    },
    {
      onClick: () => {
        handleUnassignLinode();
      },
      title: 'Unassign Linode',
    },
    {
      onClick: () => {
        handleEdit();
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        handleDelete();
      },
      title: 'Delete',
    },
  ];

  return (
    <ActionMenu actionsList={actions} ariaLabel={`Action menu for Subnet`} />
  );
};

export default SubnetsActionMenu;
