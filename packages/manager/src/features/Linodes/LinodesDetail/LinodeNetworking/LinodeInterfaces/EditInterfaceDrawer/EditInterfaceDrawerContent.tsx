import {
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
} from '@linode/queries';
import { Box, CircleProgress, ErrorState } from '@linode/ui';
import React from 'react';

import { EditInterfaceForm } from './EditInterfaceForm';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceDrawerContents = (props: Props) => {
  const { onClose, linodeId, interfaceId, regionId } = props;

  const {
    data: linodeInterface,
    error,
    isPending,
  } = useLinodeInterfaceQuery(linodeId, interfaceId);

  const {
    data: firewalls,
    error: firewallsError,
    isPending: isLoadingFirewalls,
  } = useLinodeInterfaceFirewallsQuery(linodeId, interfaceId);

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (firewallsError) {
    return <ErrorState errorText={firewallsError?.[0].reason} />;
  }

  if (isPending || isLoadingFirewalls) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height="calc(100vh - 150px)"
        justifyContent="center"
      >
        <CircleProgress size="md" />
      </Box>
    );
  }

  return (
    <EditInterfaceForm
      linodeId={linodeId}
      linodeInterface={linodeInterface}
      linodeInterfaceFirewalls={firewalls.data}
      onClose={onClose}
      regionId={regionId}
    />
  );
};
