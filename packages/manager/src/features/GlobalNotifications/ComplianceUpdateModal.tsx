import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { SupportLink } from 'src/components/SupportLink';
import { useMutateAccountAgreements } from 'src/queries/accountAgreements';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import { useQueryClient } from 'react-query';
import { queryKey } from 'src/queries/accountNotifications';

const ComplianceUpdateModal = () => {
  const [error, setError] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const queryClient = useQueryClient();

  const complianceModelContext = React.useContext(complianceUpdateContext);

  const {
    mutateAsync: updateAccountAgreements,
    isLoading,
  } = useMutateAccountAgreements();

  const handleAgree = () => {
    setError('');
    updateAccountAgreements({ eu_model: true, privacy_policy: true })
      .then(() => {
        complianceModelContext.close();
        // Re-request notifications so the GDPR notification goes away.
        queryClient.invalidateQueries(queryKey);
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
      open={complianceModelContext.isOpen}
      onClose={complianceModelContext.close}
      title="Compliance Update"
      actions={() => (
        <ActionsPanel
          primary
          primaryButtonHandler={handleAgree}
          primaryButtonLoading={isLoading}
          primaryButtonDisabled={!checked}
          primaryButtonText="Agree"
          secondary
          secondaryButtonHandler={() => {
            setChecked(false);
            complianceModelContext.close();
          }}
          secondaryButtonDataTestId="cancel"
          secondaryButtonText="Close"
        />
      )}
      error={error}
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
          text="open a Support Ticket"
          onClick={() => {
            setChecked(false);
            complianceModelContext.close();
          }}
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

export default ComplianceUpdateModal;
