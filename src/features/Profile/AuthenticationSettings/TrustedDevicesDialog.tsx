import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { deleteTrustedDevice } from 'src/services/profile';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingAndErrorProps
} from 'src/components/withLoadingAndError';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  closeDialog: () => void;
  deviceId?: number;
  refreshListOfDevices: () => void;
}

type CombinedProps = Props & LoadingAndErrorProps & WithStyles<ClassNames>;

class TrustedDevicesDialog extends React.PureComponent<CombinedProps, {}> {
  handleCloseDialog = () => {
    this.props.clearLoadingAndErrors();
    this.props.closeDialog();
  };

  handleDelete = (deviceId: number) => {
    const {
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      setErrorAndClearLoading,
      closeDialog
    } = this.props;
    setLoadingAndClearErrors();
    deleteTrustedDevice(deviceId)
      .then(() => {
        clearLoadingAndErrors();
        closeDialog();
        this.props.refreshListOfDevices();
      })
      .catch(e => {
        const errorString = getErrorStringOrDefault(
          e,
          'There was an issue removing this device.'
        );
        setErrorAndClearLoading(errorString);
      });
  };
  render() {
    const { open, closeDialog, error, deviceId, loading } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        title={`Untrust Device`}
        onClose={closeDialog}
        error={error}
        actions={
          <DialogActions
            closeDialog={this.handleCloseDialog}
            loading={loading}
            deviceId={deviceId}
            handleDelete={this.handleDelete}
          />
        }
      >
        <Typography>
          {`Are you sure you want to remove this device from your list of trusted devices?`}
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
    return handleDelete(deviceId);
  };
  render() {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.props.closeDialog} data-qa-cancel>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={this.props.loading}
          onClick={this.handleSubmit}
          data-qa-submit
        >
          Untrust Device
        </Button>
      </ActionsPanel>
    );
  }
}
