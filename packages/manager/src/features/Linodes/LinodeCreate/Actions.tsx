import { Box, Button } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import React, { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { ApiAwarenessModal } from './ApiAwarenessModal/ApiAwarenessModal';
import {
  getDoesEmployeeNeedToAssignFirewall,
  getLinodeCreatePayload,
  useLinodeCreateQueryParams,
} from './utilities';

import type { LinodeCreateFormValues } from './utilities';

interface ActionProps {
  isAlertsBetaMode?: boolean;
}

export const Actions = ({ isAlertsBetaMode }: ActionProps) => {
  const { params } = useLinodeCreateQueryParams();

  const [isAPIAwarenessModalOpen, setIsAPIAwarenessModalOpen] = useState(false);

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { aclpBetaServices } = useFlags();

  const { formState, getValues, trigger, control } =
    useFormContext<LinodeCreateFormValues>();

  const [legacyFirewallId, linodeInterfaces, interfaceGeneration, linodeId] =
    useWatch({
      control,
      name: [
        'firewall_id',
        'linodeInterfaces',
        'interface_generation',
        'linode.id',
      ],
    });

  const { permissions } = usePermissions('linode', ['clone_linode'], linodeId);

  const { permissions: accountPermissions } = usePermissions('account', [
    'create_linode',
  ]);

  const isCloneMode = params.type === 'Clone Linode';
  const isDisabled = isCloneMode
    ? !permissions.clone_linode
    : !accountPermissions.create_linode;

  const userNeedsToAssignFirewall =
    'firewallOverride' in formState.errors &&
    getDoesEmployeeNeedToAssignFirewall(
      legacyFirewallId,
      linodeInterfaces,
      interfaceGeneration
    );

  const onOpenAPIAwareness = async () => {
    sendApiAwarenessClickEvent('Button', 'View Code Snippets');
    sendLinodeCreateFormInputEvent({
      createType: params.type ?? 'OS',
      interaction: 'click',
      label: 'View Code Snippets',
    });
    if (await trigger()) {
      // If validation is successful, we open the dialog.
      setIsAPIAwarenessModalOpen(true);
    } else {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button buttonType="outlined" onClick={onOpenAPIAwareness}>
        View Code Snippets
      </Button>
      <Button
        buttonType="primary"
        disabled={isDisabled || userNeedsToAssignFirewall}
        loading={formState.isSubmitting}
        type="submit"
      >
        Create Linode
      </Button>
      <ApiAwarenessModal
        isOpen={isAPIAwarenessModalOpen}
        onClose={() => setIsAPIAwarenessModalOpen(false)}
        payLoad={getLinodeCreatePayload(structuredClone(getValues()), {
          isShowingNewNetworkingUI: isLinodeInterfacesEnabled,
          isAclpIntegration: aclpBetaServices?.linode?.alerts,
          isAclpAlertsPreferenceBeta: isAlertsBetaMode,
        })}
      />
    </Box>
  );
};
