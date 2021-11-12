import {
  Linode,
  removeIPAddress,
  removeIPv6Range,
} from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withLoadingAndError, {
  Props as LoadingErrorProps,
} from 'src/components/withLoadingAndError';
import DeleteIPActions from './DeleteIPActions';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  handleClose: () => void;
  open: boolean;
  linode?: Linode;
  IPAddress: string;
  ipRemoveSuccess?: (linode?: Linode) => void;
  prefix?: number;
}

type CombinedProps = Props & LoadingErrorProps;

export interface IPv6RangeDeleteArgs {
  IPv6Range: string;
}

export interface IPDeleteArgs {
  linodeID: number;
  IPAddress: string;
}

const DeleteIPConfirm: React.FC<CombinedProps> = (props) => {
  const handleRemoveIP = (data: IPDeleteArgs) => {
    const {
      setErrorAndClearLoading,
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      ipRemoveSuccess,
      handleClose,
      linode,
    } = props;

    setLoadingAndClearErrors();

    removeIPAddress(data)
      .then((response) => {
        clearLoadingAndErrors();
        // linode will always exist here
        if (ipRemoveSuccess && linode) {
          const linodeWithRemovedIP = {
            ...linode,
            ipv4: linode.ipv4.filter((eachIP) => eachIP !== data.IPAddress),
          };
          ipRemoveSuccess(linodeWithRemovedIP);
          handleClose();
        }
      })
      .catch((e) => {
        const errorText = getAPIErrorOrDefault(
          e,
          'There was an error removing this IP. Please try again later.'
        );
        setErrorAndClearLoading(errorText[0].reason);
      });
  };

  const handleRemoveRange = (data: IPv6RangeDeleteArgs) => {
    const {
      setErrorAndClearLoading,
      setLoadingAndClearErrors,
      clearLoadingAndErrors,
      ipRemoveSuccess,
      handleClose,
    } = props;

    setLoadingAndClearErrors();

    removeIPv6Range(data)
      .then((_) => {
        clearLoadingAndErrors();
        if (ipRemoveSuccess) {
          ipRemoveSuccess();
          handleClose();
        }
      })
      .catch((e) => {
        const errorText = getAPIErrorOrDefault(
          e,
          'There was an error removing this IP range. Please try again later.'
        );
        setErrorAndClearLoading(errorText[0].reason);
      });
  };

  const {
    handleClose,
    open,
    loading,
    error,
    IPAddress,
    linode,
    prefix,
  } = props;

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleClose}
      error={error}
      title={`Delete ${IPAddress}${prefix ? ` /${prefix}` : ''}?`}
      actions={
        <DeleteIPActions
          loading={loading}
          handleCancel={handleClose}
          IPAddress={IPAddress}
          linodeID={linode ? linode.id : undefined}
          handleDelete={linode ? handleRemoveIP : handleRemoveRange}
        />
      }
    >
      <Typography>
        {`Are you sure you want to delete ${
          linode ? 'this IP Address' : 'this IPv6 Range'
        }? This action cannot be undone.`}
      </Typography>
    </ConfirmationDialog>
  );
};

export default compose<CombinedProps, Props>(withLoadingAndError)(
  DeleteIPConfirm
);
