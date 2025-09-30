import { accountQueries, useMutateAccountAgreements } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { SupportLink } from 'src/components/SupportLink';
import { store } from 'src/new-store';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';

export const ComplianceUpdateModal = () => {
  const [error, setError] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const queryClient = useQueryClient();

  const isOpen = useStore(store, (state) => state.isComplianceModalOpen);

  const onClose = () => {
    store.setState((state) => ({ ...state, isComplianceModalOpen: false }));
  };

  const { isPending, mutateAsync: updateAccountAgreements } =
    useMutateAccountAgreements();

  const handleAgree = () => {
    setError('');
    updateAccountAgreements({ eu_model: true, privacy_policy: true })
      .then(() => {
        onClose();
        // Re-request notifications so the GDPR notification goes away.
        queryClient.invalidateQueries({
          queryKey: accountQueries.notifications.queryKey,
        });
      })
      .catch((err) => {
        const errorMessage = getErrorStringOrDefault(
          err,
          'There was an error updating your account. If this issue persists please contact Customer Support.'
        );
        setError(errorMessage);
      });
  };

  return (
    <ConfirmationDialog
      actions={() => (
        <ActionsPanel
          primaryButtonProps={{
            disabled: !checked,
            label: 'Agree',
            loading: isPending,
            onClick: handleAgree,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Close',
            onClick: () => {
              setChecked(false);
              onClose();
            },
          }}
        />
      )}
      error={error}
      onClose={onClose}
      open={isOpen}
      title="Compliance Update"
    >
      <Typography>
        Recent legal changes now require users located in Europe, or with
        deployments in Linode’s London or Frankfurt data centers, to be covered
        under the revised EU Standard Contractual Clauses.
      </Typography>
      <Typography style={{ marginTop: 16 }}>
        After your review, please click the box below if the agreement is
        acceptable, or{' '}
        <SupportLink
          onClick={() => {
            setChecked(false);
            onClose();
          }}
          text="open a Support Ticket"
          title="Updates to the new EU Model Contact"
        />{' '}
        if you have any questions.
      </Typography>
      <div style={{ marginTop: 24 }}>
        <EUAgreementCheckbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      </div>
    </ConfirmationDialog>
  );
};
