import { useVerifyDestinationQuery } from '@linode/queries';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { getDestinationPayloadDetails } from 'src/features/Delivery/deliveryUtils';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { DestinationForm } from 'src/features/Delivery/Shared/types';

export const useVerifyDestination = () => {
  const [isPending, setIsPending] = useState(false);
  const [destinationVerified, setDestinationVerified] = useState(false);
  const { mutateAsync: callVerifyDestination } = useVerifyDestinationQuery();

  const verifyDestination = async (destination: DestinationForm) => {
    setIsPending(true);
    try {
      const payload = {
        ...destination,
        details: getDestinationPayloadDetails(destination.details),
      };
      await callVerifyDestination(payload);

      setDestinationVerified(true);
      enqueueSnackbar(
        'Delivery connection test completed successfully. Data can now be sent using this configuration.',
        { variant: 'success' }
      );
    } catch (error) {
      setDestinationVerified(false);
      enqueueSnackbar(
        getAPIErrorOrDefault(
          error,
          'Delivery connection test failed. Verify your delivery settings and try again.'
        )[0].reason,
        { variant: 'error' }
      );
    } finally {
      setIsPending(false);
    }
  };

  return {
    destinationVerified,
    isPending,
    setDestinationVerified,
    verifyDestination,
  };
};
