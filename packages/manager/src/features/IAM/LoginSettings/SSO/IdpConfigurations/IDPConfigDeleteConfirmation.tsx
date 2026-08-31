import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormLabel,
  LoadingSpinner,
  Modal,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteIdpConfigMutation, usePreferences } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import { CircleProgress } from '../../../Shared/CircleProgress/CircleProgress';
import { ErrorState } from '../../../Shared/ErrorState/ErrorState';
import { Link } from '../../../Shared/Link/Link';
import styles from '../../../Shared/RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';

interface Props {
  idpConfigId: string;
  idpConfigLabel: string;
  isIdpConfigLoading?: boolean;
  onClose: () => void;
  /** Clears remaining URL params after the exit animation finishes. */
  onExited?: () => void;
  open: boolean;
}

export const IDPConfigDeleteConfirmation = (props: Props) => {
  const {
    onClose: _onClose,
    onExited,
    open,
    idpConfigId,
    idpConfigLabel,
    isIdpConfigLoading = false,
  } = props;

  const { data: permissions } = usePermissions('account', [
    'delete_idp_config',
  ]);

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

  // before-closed runs while Lit `_state === 'closing'`, when re-asserting
  // open=true is ignored — so the router can clear `open` during the exit animation.
  // Only clear `action` here so `role` stays available for the exit frame.
  const onClose = () => {
    _onClose();
  };

  const onModalClosed = () => {
    reset();
    setConfirmText('');
    onClose();
    onExited?.();
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

  const configMissing = !isIdpConfigLoading && !idpConfigId;
  const canSubmit = Boolean(idpConfigId) && !isIdpConfigLoading;

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      height={configMissing || !typeToConfirmPreference ? '275px' : '462px'}
      onModalBeforeClosed={onClose}
      onModalClosed={onModalClosed}
      open={open}
      role="dialog"
      size="medium"
      width={'459px'}
    >
      <span slot="title">{`Delete IDP Configuration ${idpConfigLabel}?`}</span>
      <div slot="body">
        {isIdpConfigLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: Spacing.S24,
            }}
          >
            <LoadingSpinner data-testid="circle-progress" size="medium" />
          </div>
        ) : configMissing ? (
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              The IDP configuration could not be found.
            </p>
          </NotificationBanner>
        ) : (
          <>
            {!permissions?.delete_idp_config && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S2 }}
                text={`You do not have permission to delete IDP configuration.`}
                type="error"
              />
            )}
            <NotificationBanner type="warning">
              Deleting this configuration permanently removes all associated IDP
              details, certificates and users lists, and disables single
              sign-on. Users will be required to log in using alternative
              methods.
            </NotificationBanner>
            {typeToConfirmPreference && (
              <>
                <p
                  style={{
                    margin: `${Spacing.S24} 0`,
                    wordBreak: 'break-word',
                  }}
                >
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
                  To disable type-to-confirm, go to the Type-to-Confirm section
                  of <Link to="/profile/preferences">Preferences.</Link>
                </p>
              </>
            )}
            {(error || preferencesError) && <ErrorState />}
          </>
        )}
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
          {configMissing ? 'Close' : 'Cancel'}
        </Button>
        {!configMissing && !isIdpConfigLoading && (
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteIDPConfigurationEndFlow}
            disabled={
              (Boolean(typeToConfirmPreference) &&
                confirmText !== idpConfigLabel) ||
              !canSubmit ||
              !permissions?.delete_idp_config
            }
            onClick={onDelete}
            processing={isPending}
            variant="danger"
          >
            Delete IDP configuration
          </Button>
        )}
      </div>
    </Modal>
  );
};
