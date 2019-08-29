import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ManagedIcon from 'src/assets/icons/managed.svg';
import MoreInfo from 'src/assets/icons/moreInfo.svg';
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
        title="Managed Services"
        copy={
          'Experience true peace of mind and let the experts at Linode manage your servers.'
        }
        buttonProps={[
          {
            onClick: () => setOpen(true),
            children: 'Add Managed services'
          },
          {
            onClick: () => null,
            children: (
              <>
                Learn more
                <MoreInfo style={{ marginLeft: '10px' }} />
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
