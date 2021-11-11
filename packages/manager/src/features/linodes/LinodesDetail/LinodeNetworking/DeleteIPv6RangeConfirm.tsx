import { Linode, removeIPv6Range } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingErrorProps,
} from 'src/components/withLoadingAndError';
import DeleteIPv6RangeActions from './DeleteIPv6RangeActions';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  handleClose: () => void;
  open: boolean;
  linode: Linode;
  IPv6Range: string;
  ipRemoveSuccess?: (linode: Linode) => void;
}

type CombinedProps = Props & LoadingErrorProps;

interface DeleteArgs {
  IPv6Range: string;
}

class DeleteIPConfirm extends React.PureComponent<CombinedProps> {
  handleRemoveIPv6Range = (data: DeleteArgs) => {
    const {
      setErrorAndClearLoading,
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      ipRemoveSuccess,
      handleClose,
      linode,
    } = this.props;

    setLoadingAndClearErrors();

    return removeIPv6Range(data)
      .then((response) => {
        clearLoadingAndErrors();
        if (ipRemoveSuccess) {
          const linodeWithRemovedIP = {
            ...linode,
            ipv4: linode.ipv4.filter((eachIP) => eachIP !== data.IPv6Range),
          };
          ipRemoveSuccess(linodeWithRemovedIP);
          handleClose();
        }
      })
      .catch((e) => {
        const errorText = getAPIErrorOrDefault(
          e,
          'There was an error removing this range. Please try again later.'
        );
        setErrorAndClearLoading(errorText[0].reason);
      });
  };
  render() {
    const { handleClose, open, loading, error, IPv6Range } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        error={error}
        title={`Delete ${IPv6Range}?`}
        actions={
          <DeleteIPv6RangeActions
            loading={loading}
            handleCancel={handleClose}
            IPv6Range={IPv6Range}
            handleDelete={this.handleRemoveIPv6Range}
          />
        }
      >
        <Typography>
          Are you sure you want to delete this IPv6 Range? This action cannot be
          undone.
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default compose<CombinedProps, Props>(withLoadingAndError)(
  DeleteIPConfirm
);
