import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

interface Props {
  handleDelete: (data: { IPv6Range: string }) => void;
  IPv6Range: string;
  handleCancel: () => void;
  loading: boolean;
}

type CombinedProps = Props;

class DeleteIPv6RangeActions extends React.PureComponent<CombinedProps> {
  handleDeleteIPv6Range = () => {
    const { IPv6Range } = this.props;
    this.props.handleDelete({
      IPv6Range,
    });
  };

  render() {
    const { handleCancel, loading } = this.props;
    return (
      <ActionsPanel>
        <Button buttonType="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.handleDeleteIPv6Range}
          loading={loading}
        >
          Delete Range
        </Button>
      </ActionsPanel>
    );
  }
}

export default DeleteIPv6RangeActions;
