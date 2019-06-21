import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingAndErrorProps
} from 'src/components/withLoadingAndError';
import { disableTwoFactor } from 'src/services/profile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  closeDialog: () => void;
  onSuccess: () => void;
}

type CombinedProps = Props & LoadingAndErrorProps;

class DisableTwoFactorDialog extends React.PureComponent<CombinedProps, {}> {
  handleCloseDialog = () => {
    this.props.clearLoadingAndErrors();
    this.props.closeDialog();
  };

  handleDisableTFA = (deviceId: number) => {
    const {
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      setErrorAndClearLoading,
      closeDialog
    } = this.props;
    setLoadingAndClearErrors();
    disableTwoFactor()
      .then(() => {
        clearLoadingAndErrors();
        closeDialog();
        this.props.onSuccess();
      })
      .catch(e => {
        const errorString = getErrorStringOrDefault(
          e,
          'There was an error disabling TFA.'
        );
        setErrorAndClearLoading(errorString);
      });
  };
  render() {
    const { open, closeDialog, error, loading } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        title={`Disable Two-Factor Authentication`}
        onClose={closeDialog}
        error={error}
        actions={
          <DialogActions
            closeDialog={this.handleCloseDialog}
            loading={loading}
            handleDisable={this.handleDisableTFA}
          />
        }
      >
        <Typography>
          Are you sure you want to disable two-factor authentication?
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default compose<CombinedProps, Props>(
  withLoadingAndError
)(DisableTwoFactorDialog);

interface ActionsProps {
  closeDialog: () => void;
  loading: boolean;
  handleDisable: (deviceId?: number) => void;
  deviceId?: number;
}

class DialogActions extends React.PureComponent<ActionsProps, {}> {
  handleSubmit = () => {
    const { handleDisable, deviceId } = this.props;
    return handleDisable(deviceId);
  };
  render() {
    return (
      <ActionsPanel>
        <Button onClick={this.props.closeDialog} buttonType="cancel" data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          loading={this.props.loading}
          onClick={this.handleSubmit}
          data-qa-submit
        >
          Disable Two-factor Authentication
        </Button>
      </ActionsPanel>
    );
  }
}
