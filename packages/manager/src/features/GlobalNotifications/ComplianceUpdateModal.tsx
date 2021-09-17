import * as React from 'react';
import { useDispatch } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';
import { Dispatch } from 'src/hooks/types';
import { useMutateAccountAgreements } from 'src/queries/accountAgreements';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';

const ComplianceUpdateModal: React.FC<{}> = () => {
  const [error, setError] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const dispatch: Dispatch = useDispatch();

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
        dispatch(requestNotifications());
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
        <ActionsPanel>
          <Button
            buttonType="secondary"
            onClick={() => {
              setChecked(false);
              complianceModelContext.close();
            }}
            data-qa-cancel
          >
            Close
          </Button>
          <Button
            buttonType="primary"
            onClick={handleAgree}
            loading={isLoading}
            disabled={!checked}
          >
            Agree
          </Button>
        </ActionsPanel>
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
