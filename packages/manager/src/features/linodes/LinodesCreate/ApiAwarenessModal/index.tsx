import React from 'react';
import { ActionsPanel, Button, Dialog, ExternalLink } from 'src/components';
import { Typography } from 'src/components/core';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  command: string;
  analyticsKey?: string;
}

const ApiAwarenessModal = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog
      title="Create using commandline"
      open={isOpen}
      onClose={onClose}
      fullWidth
    >
      <Typography variant="body1">
        You'll first need to create an{' '}
        <ExternalLink
          // onClick={() => {}}
          link="https://cloud.linode.com/profile/tokens"
          text="API access token"
          hideIcon
        />{' '}
        then save your existing token to an environment variable or substitue it
        into the command. Read our guideline to learn about creating{' '}
        <ExternalLink
          // onClick={() => {}}
          link="https://www.linode.com/docs/api/profile/#personal-access-token-create"
          text=" API access tokens"
          hideIcon
        />{' '}
        and Linodes using{' '}
        <ExternalLink
          // onClick={() => {}}
          link="https://www.linode.com/docs/api/"
          text="Linode API"
          hideIcon
        />
        .
      </Typography>

      <ActionsPanel>
        <Button buttonType="secondary" onClick={onClose}>
          Close
        </Button>
      </ActionsPanel>
    </Dialog>
  );
};

export default ApiAwarenessModal;
