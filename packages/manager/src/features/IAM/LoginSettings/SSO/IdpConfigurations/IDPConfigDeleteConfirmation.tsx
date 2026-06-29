import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormLabel,
  Modal,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteIdpConfigMutation, usePreferences } from '@linode/queries';
import * as React from 'react';

import { CircleProgress } from 'src/features/IAM/Shared/CircleProgress/CircleProgress';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import { Link } from 'src/features/IAM/Shared/Link/Link';

import styles from '../../../Shared/RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';

interface Props {
  idpConfigId: string;
  idpConfigLabel: string;
  onClose: () => void;
  open: boolean;
}

export const IDPConfigDeleteConfirmation = (props: Props) => {
  const { onClose: _onClose, open, idpConfigId, idpConfigLabel } = props;

  const {
    mutateAsync: deleteIdpConfig,
    isPending,
    error,
    reset,
  } = useDeleteIdpConfigMutation();

  const {
    data: typeToConfirmPreference,
    error: preferencesError,
    isLoading: isLoadingPreferences,
  } = usePreferences((preferences) => preferences?.type_to_confirm ?? true);

  const [confirmText, setConfirmText] = React.useState('');

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    setConfirmText('');
    _onClose();
  };

  const onDelete = async () => {
    await deleteIdpConfig({ euuid: idpConfigId });
    toast.open({
      text: 'IDP Configuration has been deleted successfully.',
      type: 'success',
    });

    onClose();
  };

  if (isLoadingPreferences) {
    return <CircleProgress />;
  }

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      height={typeToConfirmPreference ? '462px' : '275px'}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size="medium"
      width={'459px'}
    >
      <span slot="title">{`Delete IDP Configuration ${idpConfigLabel}?`}</span>
      <div slot="body">
        <NotificationBanner type="warning">
          Deleting this configuration permanently removes all associated IDP
          details, certificates and users lists, and disables single sign-on.
          Users will be required to log in using alternative methods.
        </NotificationBanner>
        {typeToConfirmPreference && (
          <>
            <p style={{ margin: `${Spacing.S24} 0`, wordBreak: 'break-word' }}>
              To confirm deletion, type the label of the IDP configuration{' '}
              <strong>({idpConfigLabel})</strong> in the field below:
            </p>
            <FormLabel htmlFor="v-inp-field" slot="label">
              IDP Label
            </FormLabel>
            <TextField
              data-pendo-id={
                IAM_SSO_IDP_PENDO_IDS.deleteIDPConfigurationIdpLabel
              }
              id="v-inp-field"
              onInput={(e: React.FormEvent<HTMLElement>) =>
                setConfirmText((e.target as HTMLInputElement).value)
              }
              style={{ boxSizing: 'border-box', marginTop: Spacing.S8 }}
              value={confirmText}
            />
            <p style={{ margin: `${Spacing.S24} 0 0` }}>
              To disable type-to-confirm, go to the Type-to-Confirm section of{' '}
              <Link to="/profile/preferences">Preferences.</Link>
            </p>
          </>
        )}
        {(error || preferencesError) && <ErrorState />}
      </div>
      <div
        slot="actions"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: Spacing.S8,
          alignItems: 'center',
        }}
      >
        <Button
          data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteIDPConfigurationCancel}
          onClick={onClose}
          style={{ marginRight: Spacing.S8 }}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteIDPConfigurationEndFlow}
          disabled={
            Boolean(typeToConfirmPreference) && confirmText !== idpConfigLabel
          }
          onClick={onDelete}
          processing={isPending}
          variant="danger"
        >
          Delete IDP configuration
        </Button>
      </div>
    </Modal>
  );
};
