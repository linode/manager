import * as React from 'react';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  warning?: string;
}

type CombinedProps = Props;

class UserAgentNotification extends React.Component<CombinedProps, {}> {
  actions = () => (
    <Button onClick={this.props.onClose} buttonType="primary">
      Dismiss
    </Button>
  );

  render() {
    const { warning } = this.props;

    return (
      <ConfirmationDialog
        data-qa-browser-warning
        actions={this.actions}
        open={this.props.open}
        onClose={this.props.onClose}
        title="Please update your browser"
      >
        {warning}
      </ConfirmationDialog>
    );
  }
}

export default UserAgentNotification;
