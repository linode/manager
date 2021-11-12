import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

interface Props {
  handleDelete: (data: {
    linodeID?: number;
    IPAddress?: string;
    IPv6Range?: string;
  }) => void;
  IPAddress: string;
  linodeID?: number;
  handleCancel: () => void;
  loading: boolean;
}

type CombinedProps = Props;

class DeleteIPActions extends React.PureComponent<CombinedProps> {
  handleDeleteIP = () => {
    const { linodeID, IPAddress } = this.props;
    linodeID
      ? this.props.handleDelete({
          linodeID,
          IPAddress,
        })
      : this.props.handleDelete({
          IPv6Range: IPAddress,
        });
  };

  render() {
    const { handleCancel, loading, linodeID } = this.props;
    return (
      <ActionsPanel>
        <Button buttonType="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.handleDeleteIP}
          loading={loading}
        >
          {linodeID ? 'Delete IP' : 'Delete Range'}
        </Button>
      </ActionsPanel>
    );
  }
}

export default DeleteIPActions;
