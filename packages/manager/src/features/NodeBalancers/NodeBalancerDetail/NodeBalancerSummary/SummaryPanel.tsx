import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodeBalancersFirewallsQuery,
  useNodebalancerUpdateMutation,
  useRegionsQuery,
} from '@linode/queries';
import { Paper, Typography } from '@linode/ui';
import { convertMegabytesTo } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { TagCell } from 'src/components/TagCell/TagCell';
import {
  useIsLkeEnterpriseEnabled,
  useKubernetesBetaEndpoint,
} from 'src/features/Kubernetes/kubeUtils';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';

export const SummaryPanel = () => {
  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();

  const { id } = useParams({ from: '/nodebalancers/$id' });

  const { data: nodebalancer } = useNodeBalancerQuery(
    id,
    true,
    isLkeEnterpriseLAFeatureEnabled
  );
  const { data: configs } = useAllNodeBalancerConfigsQuery(id);
  const { data: regions } = useRegionsQuery();
  const { data: attachedFirewallData } = useNodeBalancersFirewallsQuery(id);
  const linkText = attachedFirewallData?.data[0]?.label;
  const linkID = attachedFirewallData?.data[0]?.id;
  const region = regions?.find((r) => r.id === nodebalancer?.region);
  const { mutateAsync: updateNodeBalancer } = useNodebalancerUpdateMutation(id);
  const displayFirewallLink = !!attachedFirewallData?.data?.length;

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodebalancer?.id,
  });

  // If we can't get the cluster (status === 'error'), we can assume it's been deleted
  const { status: clusterStatus } = useKubernetesClusterQuery({
    enabled: Boolean(nodebalancer?.lke_cluster),
    id: nodebalancer?.lke_cluster?.id ?? -1,
    isUsingBetaEndpoint,
    options: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  });

  const configPorts = configs?.reduce((acc, config) => {
    return [...acc, { configId: config.id, port: config.port }];
  }, []);

  const down = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.down;
  }, 0); // add the downtime for each config together

  const up = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.up;
  }, 0); // add the uptime for each config together

  if (!nodebalancer || !configs) {
    return null;
  }

  return (
    <StyledRootDiv>
      <StyledSummarySectionWrapper>
        <StyledSummarySection>
          <StyledTitle data-qa-title variant="h3">
            NodeBalancer Details
          </StyledTitle>
          {nodebalancer.type === 'premium' && (
            <StyledSection>
              <Typography data-qa-type variant="body1">
                <strong>Type: </strong>
                Premium
              </Typography>
            </StyledSection>
          )}
          {nodebalancer.lke_cluster && (
            <StyledSection>
              <Typography data-qa-cluster variant="body1">
                <strong>Cluster: </strong>
                {clusterStatus === 'error' ? (
                  <>
                    <span style={{ textDecoration: 'line-through' }}>
                      {nodebalancer.lke_cluster.label}
                    </span>
                    <span style={{ fontStyle: 'italic' }}> (deleted)</span>
                  </>
                ) : (
                  <Link
                    accessibleAriaLabel={`Cluster ${nodebalancer.lke_cluster.label}`}
                    to={`/kubernetes/clusters/${nodebalancer.lke_cluster.id}/summary`}
                  >
                    {nodebalancer.lke_cluster.label}
                  </Link>
                )}
              </Typography>
            </StyledSection>
          )}
          <StyledSection>
            <Typography data-qa-ports variant="body1">
              <strong>Ports: </strong>
              {configPorts?.length === 0 && 'None'}
              {configPorts?.map(({ configId, port }, i) => (
                <React.Fragment key={configId}>
                  <Link
                    accessibleAriaLabel={`Port ${port}`}
                    className="secondaryLink"
                    to={`/nodebalancers/${nodebalancer?.id}/configurations/${configId}`}
                  >
                    {port}
                  </Link>
                  {i < configPorts?.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </Typography>
          </StyledSection>
          <StyledSection>
            <Typography variant="body1">
              <strong>Backend Status: </strong>
              {`${up} up, ${down} down`}
            </Typography>
          </StyledSection>
          <StyledSection>
            <Typography variant="body1">
              <strong>Transferred: </strong>
              {convertMegabytesTo(nodebalancer.transfer.total)}
            </Typography>
          </StyledSection>
          <StyledSection>
            <Typography style={{ wordBreak: 'break-word' }} variant="body1">
              <strong>Host Name: </strong>
              {nodebalancer.hostname}
            </Typography>
          </StyledSection>
          <StyledSection>
            <Typography data-qa-region variant="body1">
              <strong>Region:</strong> {region?.label}
            </Typography>
          </StyledSection>
        </StyledSummarySection>
      </StyledSummarySectionWrapper>
      {displayFirewallLink && (
        <StyledSummarySection>
          <StyledTitle data-qa-title variant="h3">
            Firewall
          </StyledTitle>
          <Typography data-qa-firewall variant="body1">
            <Link
              accessibleAriaLabel={`Firewall ${linkText}`}
              className="secondaryLink"
              to={`/firewalls/${linkID}`}
            >
              {linkText}
            </Link>
          </Typography>
        </StyledSummarySection>
      )}
      <StyledSummarySection>
        <StyledTitle data-qa-title variant="h3">
          IP Addresses
        </StyledTitle>
        <StyledSection>
          <StyledIPGrouping data-qa-ip>
            {nodebalancer?.ipv4 && (
              <IPAddress ips={[nodebalancer?.ipv4]} isHovered={true} showMore />
            )}
            {nodebalancer?.ipv6 && (
              <IPAddress ips={[nodebalancer?.ipv6]} isHovered={true} />
            )}
          </StyledIPGrouping>
        </StyledSection>
      </StyledSummarySection>
      <StyledSummarySection>
        <StyledTitle data-qa-title variant="h3">
          Tags
        </StyledTitle>
        <TagCell
          disabled={isNodeBalancerReadOnly}
          tags={nodebalancer?.tags}
          updateTags={(tags) => updateNodeBalancer({ tags })}
          view="panel"
        />
      </StyledSummarySection>
    </StyledRootDiv>
  );
};

const StyledRootDiv = styled('div', {
  label: 'StyledRootDiv',
})(({ theme }) => ({
  paddingTop: theme.spacing(),
}));

const StyledSummarySectionWrapper = styled('div', {
  label: 'StyledSummarySectionWrapper',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(6),
  },
}));

const StyledSummarySection = styled(Paper, {
  label: 'StyledSummarySection',
})(({ theme }) => ({
  height: '93%',
  marginBottom: theme.spacing(2),
  minHeight: '160px',
  padding: theme.spacing(2.5),
}));

const StyledTitle = styled(Typography, {
  label: 'StyledTitle',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledSection = styled('div', {
  label: 'StyledSection',
})(({ theme }) => ({
  marginBottom: theme.spacing(1),
  ...theme.typography.body1,
  '& .dif': {
    '& .chip': {
      position: 'absolute',
      right: -10,
      top: '-4px',
    },
    position: 'relative',
    width: 'auto',
  },
}));

const StyledIPGrouping = styled('div', {
  label: 'StyledIPGrouping',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '-2px 0 0 2px',
}));
