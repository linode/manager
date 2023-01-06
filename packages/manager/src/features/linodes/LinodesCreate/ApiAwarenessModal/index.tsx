import React from 'react';
import { ActionsPanel, Button, Dialog, ExternalLink } from 'src/components';
import { Typography } from 'src/components/core';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ApiAwarenessModal = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog
      title="Create using command line"
      open={isOpen}
      onClose={onClose}
      maxWidth={'sm'}
      fullHeight
    >
      <Typography variant="body1">
        You&#39;ll first need to{' '}
        <ExternalLink
          link="/profile/tokens"
          text="create an API access token"
          hideIcon
        />{' '}
        then save your existing token to an environment variable or substitue it
        into the command. Read our guides to learn about creating{' '}
        <ExternalLink
          link="https://www.linode.com/docs/api/profile/#personal-access-token-create"
          text=" API access tokens"
          hideIcon
        />{' '}
        and Linodes using the{' '}
        <ExternalLink
          link="https://www.linode.com/docs/api/"
          text="Linode API"
          hideIcon
        />
        .
      </Typography>

      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={onClose}
          data-testid="close-button"
        >
          Close
        </Button>
      </ActionsPanel>
    </Dialog>
  );
};

export default ApiAwarenessModal;
