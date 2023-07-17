import { Domain } from '@linode/api-v4/lib/domains';
import { has } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu';

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

interface Props {
  deleteData?: DeleteData;
  editPayload: Domain | EditPayload;
  label: string;
  onEdit: (data: Domain | EditPayload) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const DomainRecordActionMenu: React.FC<CombinedProps> = (props) => {
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
    has('deleteData', props)
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

export default withRouter(DomainRecordActionMenu);
