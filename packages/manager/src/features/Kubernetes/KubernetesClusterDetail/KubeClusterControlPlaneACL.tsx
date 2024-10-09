import * as React from 'react';

import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { useKubernetesControlPlaneACLQuery } from 'src/queries/kubernetes';
import { pluralize } from 'src/utilities/pluralize';

import type { KubernetesCluster } from '@linode/api-v4';

interface Props {
  cluster: KubernetesCluster;
  handleOpenDrawer: () => void;
  setControlPlaneACLMigrated: (s: boolean) => void;
}

export const KubeClusterControlPlaneACL = React.memo((props: Props) => {
  const { cluster, handleOpenDrawer, setControlPlaneACLMigrated } = props;

  const {
    data: acl_response,
    isError: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(cluster.id);

  const enabledACL = acl_response?.acl.enabled ?? false;
  // const revisionIDACL = acl_response ? acl_response.acl['revision-id'] : '';
  const totalIPv4 = acl_response?.acl.addresses?.ipv4?.length ?? 0;
  const totalIPv6 = acl_response?.acl.addresses?.ipv6?.length ?? 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  // note to self: look into this method/if it's necessary
  const failedMigrationStatus = () => {
    // when a cluster has not migrated, the query will always fail
    setControlPlaneACLMigrated(!isErrorKubernetesACL);
    return isErrorKubernetesACL;
  };

  const determineButtonCopy = failedMigrationStatus()
    ? 'Install IPACL'
    : enabledACL
    ? pluralize('IP Address', 'IP Addresses', totalNumberIPs)
    : 'Enable IPACL';

  return (
    // will get rid of this fragment eventually...just doing some cleanup here and there
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isLoadingKubernetesACL ? (
        <Box sx={{ paddingLeft: 1 }}>
          <CircleProgress noPadding size="sm" />
        </Box>
      ) : (
        <StyledLinkButton onClick={handleOpenDrawer}>
          {determineButtonCopy}
        </StyledLinkButton>
      )}
    </>
  );
});
