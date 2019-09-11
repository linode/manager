import { Linode, removeIPAddress } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingErrorProps
} from 'src/components/withLoadingAndError';
import DeleteIPActions from './DeleteIPActions';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  handleClose: () => void;
  open: boolean;
  linode: Linode;
  IPAddress: string;
  ipRemoveSuccess?: (linode: Linode) => void;
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
      handleClose,
      linode
    } = this.props;

    setLoadingAndClearErrors();

    return removeIPAddress(data)
      .then(response => {
        clearLoadingAndErrors();
        if (ipRemoveSuccess) {
          const linodeWithRemovedIP = {
            ...linode,
            ipv4: linode.ipv4.filter(eachIP => eachIP !== data.IPAddress)
          };
          ipRemoveSuccess(linodeWithRemovedIP);
          handleClose();
        }
      })
      .catch(e => {
        const errorText = getAPIErrorOrDefault(
          e,
          'There was an error removing this IP. Please try again later.'
        );
        setErrorAndClearLoading(errorText[0].reason);
      });
  };
  render() {
    const {
      handleClose,
      open,
      loading,
      error,
      IPAddress,
      linode: { id: linodeID }
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
          Are you sure you want to delete this IP Address? This action cannot be
          undone.
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default compose<CombinedProps, Props>(withLoadingAndError)(
  DeleteIPConfirm
);
