import { deleteSSHKey } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  onSuccess: () => void;
  closeDialog: () => void;
  id?: number;
  label?: string;
}

interface State {
  submitting: boolean;
  error?: Error;
}

type CombinedProps = Props;

class DeleteSSHKeyDialog extends React.PureComponent<CombinedProps, State> {
  state: State = {
    submitting: false,
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /** Clear state (when opening dialog) left on state from previous interactions. */
    if (!prevProps.open && this.props.open) {
      this.setState({ submitting: false, error: undefined });
    }
  }

  render() {
    const { open, label, closeDialog } = this.props;
    const { error } = this.state;

    return (
      <ConfirmationDialog
        open={open}
        title={`Delete SSH Key`}
        actions={this.renderConfirmDeleteActions}
        onClose={closeDialog}
      >
        {error && (
          <Notice error text={`Unable to delete SSH key. Please try again.`} />
        )}
        <Typography>
          Are you sure you want to delete SSH key {label}?
        </Typography>
      </ConfirmationDialog>
    );
  }

  renderConfirmDeleteActions = () => {
    const { closeDialog } = this.props;
    const { submitting } = this.state;

    return (
      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={closeDialog}
          data-qa-cancel-delete
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.onSubmit}
          loading={submitting}
          data-qa-confirm-delete
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  onSubmit = () => {
    if (!this.props.id) {
      return;
    }

    this.setState({ submitting: true, error: undefined });

    deleteSSHKey(this.props.id)
      .then(() => {
        this.setState({ submitting: false }, () => this.props.onSuccess());
      })
      .catch((error) => {
        this.setState({ submitting: false, error });
      });
  };
}

export default DeleteSSHKeyDialog;
