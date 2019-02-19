import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingErrorProps
} from 'src/components/withLoadingAndError';
import DeleteIPActions from './DeleteIPActions';

import { removeIPAddress } from 'src/services/linodes/linodeIPs';

interface Props {
  handleClose: () => void;
  open: boolean;
  linodeID: number;
  IPAddress: string;
  ipRemoveSuccess?: () => void;
}

type CombinedProps = Props & LoadingErrorProps;

interface DeleteArgs {
  linodeID: number;
  IPAddress: string;
}

class DeleteIPConfirm extends React.PureComponent<CombinedProps> {
  handleRemoveIP = (data: DeleteArgs) => {
    const {
      setErrorAndClearLoading,
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      ipRemoveSuccess,
      handleClose
    } = this.props;

    setLoadingAndClearErrors();

    return removeIPAddress(data)
      .then(response => {
        clearLoadingAndErrors();
        if (ipRemoveSuccess) {
          ipRemoveSuccess();
          handleClose();
        }
      })
      .catch(e => {
        const errText = pathOr(
          'There was an error removing this IP. Please try again later',
          ['response', 'data', 'errors', 0, 'reason'],
          e
        );
        setErrorAndClearLoading(errText);
      });
  };
  render() {
    const {
      handleClose,
      open,
      loading,
      error,
      IPAddress,
      linodeID
    } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        error={error}
        title={`Delete ${IPAddress}?`}
        actions={
          <DeleteIPActions
            loading={loading}
            handleCancel={handleClose}
            IPAddress={IPAddress}
            linodeID={linodeID}
            handleDelete={this.handleRemoveIP}
          />
        }
      >
        <Typography>
          Are you sure you wish to delete this IP Address. This action cannot be
          undone.
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default compose<CombinedProps, Props>(withLoadingAndError)(
  DeleteIPConfirm
);
