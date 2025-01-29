import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Domain } from '@linode/api-v4/lib/domains';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface EditPayload {
  id?: number;
  name?: string;
  port?: number;
  priority?: number;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  ttl_sec?: number;
  weight?: number;
}

interface DeleteData {
  onDelete: (id: number) => void;
  recordID: number;
}

interface DomainRecordActionMenuProps {
  deleteData?: DeleteData;
  editPayload: Domain | EditPayload;
  label: string;
  onEdit: (data: Domain | EditPayload) => void;
}

export const DomainRecordActionMenu = (props: DomainRecordActionMenuProps) => {
  const { deleteData, editPayload, onEdit } = props;

  const handleEdit = () => {
    onEdit(editPayload);
  };

  const handleDelete = () => {
    deleteData!.onDelete(deleteData!.recordID);
  };

  const actions = [
    {
      onClick: () => {
        handleEdit();
      },
      title: 'Edit',
    },
    Boolean(props.deleteData)
      ? {
          onClick: () => {
            handleDelete();
          },
          title: 'Delete',
        }
      : null,
  ].filter(Boolean) as Action[];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Record ${props.label}`}
    />
  );
};
