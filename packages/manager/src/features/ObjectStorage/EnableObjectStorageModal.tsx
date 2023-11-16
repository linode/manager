import { Region } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { OBJ_STORAGE_PRICE } from 'src/utilities/pricing/constants';

export const OBJ_STORAGE_STORAGE_AMT = '250 GB';
export const OBJ_STORAGE_NETWORK_TRANSFER_AMT = '1 TB';
export interface EnableObjectStorageProps {
  handleSubmit: () => void;
  onClose: () => void;
  open: boolean;
  regionId?: Region['id'];
}

export const EnableObjectStorageModal = React.memo(
  (props: EnableObjectStorageProps) => {
    const { handleSubmit, onClose, open, regionId } = props;

    return (
      <ConfirmationDialog
        actions={() => (
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'enable-obj',
              label: 'Enable Object Storage',
              onClick: () => {
                onClose();
                handleSubmit();
              },
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        )}
        onClose={onClose}
        open={open}
        title="Enable Object Storage"
      >
        <StyledTypography>
          To create your first {regionId ? 'bucket' : 'access key'}, you need to
          enable Object Storage.{' '}
        </StyledTypography>
        <StyledTypography>
          Object Storage costs a flat rate of{' '}
          <strong>${OBJ_STORAGE_PRICE.monthly}/month</strong>, and includes{' '}
          {OBJ_STORAGE_STORAGE_AMT} of storage. When you enable Object Storage,{' '}
          {OBJ_STORAGE_NETWORK_TRANSFER_AMT} of outbound data transfer will be
          added to your global network transfer pool.
        </StyledTypography>
        <StyledTypography>
          <Link to="https://www.linode.com/pricing/#object-storage">
            Learn more
          </Link>{' '}
          about pricing and specifications.
        </StyledTypography>
        <Notice spacingBottom={0} variant="warning">
          To discontinue billing, you&rsquo;ll need to cancel Object Storage in
          your &nbsp;
          <Link to="/account/settings">Account Settings</Link>.
        </Notice>
      </ConfirmationDialog>
    );
  }
);

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontSize: '1rem',
  marginBottom: theme.spacing(2),
}));
