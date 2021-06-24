import { Domain } from '@linode/api-v4/lib/domains';
import { has } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';

interface EditPayload {
  id?: number;
  name?: string;
  service?: string | null;
  target?: string;
  ttl_sec?: number;
  priority?: number;
  protocol?: string | null;
  port?: number;
  weight?: number;
  tag?: string | null;
}

interface DeleteData {
  recordID: number;
  onDelete: (id: number) => void;
}

interface Props {
  onEdit: (data: Domain | EditPayload) => void;
  deleteData?: DeleteData;
  editPayload: Domain | EditPayload;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const DomainRecordActionMenu: React.FC<CombinedProps> = (props) => {
  const { editPayload, onEdit, deleteData } = props;

  const handleEdit = () => {
    onEdit(editPayload);
  };

  const handleDelete = () => {
    deleteData!.onDelete(deleteData!.recordID);
  };

  const actions = [
    {
      title: 'Edit',
      onClick: () => {
        handleEdit();
      },
    },
    has('deleteData', props)
      ? {
          title: 'Delete',
          onClick: () => {
            handleDelete();
          },
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
