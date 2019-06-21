import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

interface Props {
  handleDelete: (data: { linodeID: number; IPAddress: string }) => void;
  IPAddress: string;
  linodeID: number;
  handleCancel: () => void;
  loading: boolean;
}

type CombinedProps = Props;

class DeleteIPActions extends React.PureComponent<CombinedProps> {
  handleDeleteIP = () => {
    const { linodeID, IPAddress } = this.props;
    this.props.handleDelete({
      linodeID,
      IPAddress
    });
  };

  render() {
    const { handleCancel, loading } = this.props;
    return (
      <ActionsPanel>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={this.handleDeleteIP}
          loading={loading}
        >
          Yes - delete this sucker
        </Button>
      </ActionsPanel>
    );
  }
}

export default DeleteIPActions;
