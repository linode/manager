import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ManagedIcon from 'src/assets/icons/managed.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Placeholder from 'src/components/Placeholder';
import withLinodes from 'src/containers/withLinodes.container';
import { pluralize } from 'src/utilities/pluralize';

import { enableManaged } from 'src/services/managed';

const copy = (
  <>
    <Typography variant="subtitle1">
      Let us worry about your infrastructure, so you can get back to worrying
      about your business. Linode Managed helps keep your systems up and running
      with our team of Linode experts responding to monitoring events, so you
      can sleep well. Linode Managed includes 24/7 monitoring and incident
      responses, backups and Longview Pro. +$100/mo per Linode.{` `}
    </Typography>
    <Typography variant="subtitle1" style={{ marginTop: 8 }}>
      <ExternalLink
        link="https://linode.com/managed"
        text="Learn more about Managed."
      />
    </Typography>
  </>
);

export interface StateProps {
  linodeCount: number;
}

export interface Props {
  update: (data: Partial<AccountSettings>) => void;
}

export type CombinedProps = Props & StateProps;

const ManagedPlaceholder: React.FC<CombinedProps> = props => {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const { update } = props;

  const handleClose = () => {
    setOpen(false);
    setError(undefined);
  };

  const handleError = (e: APIError[]) => {
    setError(e[0].reason);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    setError(undefined);
    enableManaged()
      .then(() => {
        handleClose();
        update({ managed: true });
      })
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleSubmit}
        data-qa-submit-managed-enrollment
        loading={isLoading}
      >
        Enable Managed
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <Placeholder
        icon={ManagedIcon}
        title="Linode Managed"
        copy={copy}
        buttonProps={{
          onClick: () => setOpen(true),
          children: 'Upgrade to Managed now!'
        }}
      />
      <ConfirmationDialog
        open={isOpen}
        error={error}
        onClose={() => handleClose()}
        title="Confirm Managed Enrollment"
        actions={actions}
      >
        <Typography>
          Linode Managed costs an additional $100/mo per Linode. {` `}
          You currently have{` `}
          <strong>
            {pluralize('Linode', 'Linodes', props.linodeCount)}
          </strong>{' '}
          on your account. This will increase your projected monthly bill by{' '}
          <strong>${`${props.linodeCount * 100}/month`}</strong>. Are you sure?{' '}
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default withLinodes((ownProps, entities, loading, error) => ({
  linodeCount: entities.length
}))(ManagedPlaceholder);
