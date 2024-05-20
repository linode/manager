import { CreateLinodeRequest } from '@linode/api-v4';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { ApiAwarenessModal } from '../LinodesCreate/ApiAwarenessModal/ApiAwarenessModal';
import { getLinodeCreatePayload } from './utilities';

export const Actions = () => {
  const [isAPIAwarenessModalOpen, setIsAPIAwarenessModalOpen] = useState(false);

  const {
    formState,
    getValues,
    trigger,
  } = useFormContext<CreateLinodeRequest>();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const onOpenAPIAwareness = async () => {
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
        Create Using Command Line
      </Button>
      <Button
        buttonType="primary"
        disabled={isLinodeCreateRestricted}
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
