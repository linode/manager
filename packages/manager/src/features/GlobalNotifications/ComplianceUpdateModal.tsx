import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from 'src/components/ConfirmationDialog';
import Button from 'src/components/Button';

import { useMutateAccountAgreements } from 'src/queries/accountAgreements';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import Typography from 'src/components/core/Typography';
import EUAgreementCheckbox from '../Account/Agreements/EUAgreementCheckbox';

type Props = Omit<ConfirmationDialogProps, 'title'>;

const ComplianceUpdateModal: React.FC<Props> = (props) => {
  const [error, setError] = React.useState('');
  const [checked, setChecked] = React.useState(false);

  const {
    mutateAsync: updateAccountAgreements,
    isLoading,
  } = useMutateAccountAgreements();

  const handleClick = () => {
    setError('');
    updateAccountAgreements({ eu_model: true })
      .then(() => {
        props.onClose();
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
      {...props}
      title="Compliance Update"
      actions={() => (
        <ActionsPanel>
          <Button
            buttonType="secondary"
            onClick={() => {
              setChecked(false);
              props.onClose();
            }}
            data-qa-cancel
          >
            Close
          </Button>
          <Button
            buttonType="primary"
            onClick={handleClick}
            loading={isLoading}
            disabled={!checked}
          >
            Return to Cloud Manager
          </Button>
        </ActionsPanel>
      )}
      error={error}
    >
      <Typography>
        Recent legal changes now require all users with deployments in Linode’s
        London or Frankfurt data centers to be covered under the EU Standard
        Contractual Clauses.
      </Typography>
      <Typography style={{ marginTop: 16 }}>
        After your review, please click the box below if the agreement is
        acceptable, or contact us at support@linode.com if you have any
        questions.
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
