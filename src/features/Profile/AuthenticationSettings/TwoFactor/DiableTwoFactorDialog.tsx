import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import { disableTwoFactor } from 'src/services/profile';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { Props as LoadingAndErrorProps, withLoadingAndError }
  from 'src/components/withLoadingAndError';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  closeDialog: () => void;
  onSuccess: () => void;
}

type CombinedProps = Props
  & LoadingAndErrorProps
  & WithStyles<ClassNames>;

class TrustedDevicesDialog extends React.PureComponent<CombinedProps, {}> {
  handleCloseDialog = () => {
    this.props.clearLoadingAndErrors();
    this.props.closeDialog();
  }

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
        const defaultError = 'There was an error disabling TFA.';
        const errorString = pathOr(defaultError, ['response', 'data', 'errors', 0, 'reason'], e);
        setErrorAndClearLoading(errorString)
      })
  }
  render() {
    const {
      open,
      closeDialog,
      error,
      loading,
    } = this.props;

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
            handleDelete={this.handleDisableTFA}
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  withLoadingAndError
)(TrustedDevicesDialog);

interface ActionsProps {
  closeDialog: () => void;
  loading: boolean;
  handleDelete: (deviceId?: number) => void;
  deviceId?: number;
}

class DialogActions extends React.PureComponent<ActionsProps, {}> {
  handleSubmit = () => {
    const { handleDelete, deviceId } = this.props;
    return handleDelete(deviceId)
  }
  render() {

    return (
      <ActionsPanel>
        <Button
          onClick={this.props.closeDialog}
          type="cancel"
          data-qa-cancel
        >
          Cancel
      </Button>
        <Button
          type="secondary"
          destructive
          loading={this.props.loading}
          onClick={this.handleSubmit}
          data-qa-submit
        >
          Disable Two-factor Authenitcation
      </Button>
      </ActionsPanel>

    )
  }
}
