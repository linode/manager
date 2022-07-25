import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { IPv6RangeDeleteArgs, IPDeleteArgs } from './DeleteIPConfirm';

interface Props {
  handleDelete: (data: IPv6RangeDeleteArgs | IPDeleteArgs) => void;
  IPAddress: string;
  linodeID?: number;
  handleCancel: () => void;
  loading: boolean;
}

const DeleteIPActions = (props: Props) => {
  const { handleCancel, loading, linodeID, handleDelete, IPAddress } = props;

  const handleDeleteIP = () => {
    linodeID
      ? handleDelete({
          linodeID,
          IPAddress,
        })
      : handleDelete({
          IPv6Range: IPAddress,
        });
  };

  return (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={handleDeleteIP} loading={loading}>
        {linodeID ? 'Delete IP' : 'Delete Range'}
      </Button>
    </ActionsPanel>
  );
};

export default DeleteIPActions;
