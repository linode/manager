import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { ApiAwarenessModal } from '../LinodesCreate/ApiAwarenessModal/ApiAwarenessModal';
import { getLinodeCreatePayload } from './utilities';

import type { LinodeCreateFormValues } from './utilities';

export const Actions = () => {
  const flags = useFlags();

  const [isAPIAwarenessModalOpen, setIsAPIAwarenessModalOpen] = useState(false);

  const isDxToolsAdditionsEnabled = flags?.apicliDxToolsAdditions;

  const {
    formState,
    getValues,
    trigger,
  } = useFormContext<LinodeCreateFormValues>();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const disableSubmitButton =
    isLinodeCreateRestricted || 'firewallOverride' in formState.errors;

  const onOpenAPIAwareness = async () => {
    sendApiAwarenessClickEvent('Button', 'Create Using Command Line');
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
        {isDxToolsAdditionsEnabled
          ? 'View Code Snippets'
          : 'Create using command line'}
      </Button>
      <Button
        buttonType="primary"
        disabled={disableSubmitButton}
        loading={formState.isSubmitting}
        type="submit"
      >
        Create Linode
      </Button>
      <ApiAwarenessModal
        isOpen={isAPIAwarenessModalOpen}
        onClose={() => setIsAPIAwarenessModalOpen(false)}
        payLoad={getLinodeCreatePayload(structuredClone(getValues()))}
      />
    </Box>
  );
};
