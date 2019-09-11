import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ExternalLink from 'src/assets/icons/external-link.svg';
import ManagedIcon from 'src/assets/icons/managed.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';
import withLinodes from 'src/containers/withLinodes.container';
import { pluralize } from 'src/utilities/pluralize';

import { enableManaged } from 'src/services/managed';

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
        Add Managed services
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <Placeholder
        icon={ManagedIcon}
        title="Linode Managed"
        copy={`Let us worry about your infrastructure, so you can get back to worrying about your business. 
           Linode Managed helps keep your systems up and running with our team of Linode experts responding to monitoring events, so you can sleep well.
           Linode Managed includes 24/7 monitoring and incident responses, backups, and Longview Pro. +$100/month per Linode.`}
        buttonProps={[
          {
            onClick: () => setOpen(true),
            children: 'Add Linode Managed'
          },
          {
            href: 'https://linode.com/managed',
            target: '_blank', // Not a great solution.
            children: (
              <>
                Learn more
                <ExternalLink style={{ marginLeft: '10px' }} />
              </>
            ),
            buttonType: 'secondary'
          }
        ]}
      />
      <ConfirmationDialog
        open={isOpen}
        error={error}
        onClose={() => handleClose()}
        title="Just to confirm..."
        actions={actions}
      >
        <Typography variant="subtitle1">
          Linode Managed costs an additional{' '}
          <strong>$100 per month per Linode.</strong> {` `}
          You currently have{` `}
          <strong>{pluralize('Linode', 'Linodes', props.linodeCount)}</strong>,
          so Managed will increase your projected monthly bill by{' '}
          <strong>${`${props.linodeCount * 100}`}</strong>.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default withLinodes((ownProps, entities, loading, error) => ({
  linodeCount: entities.length
}))(ManagedPlaceholder);
