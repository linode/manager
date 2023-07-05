import * as React from 'react';
import IPAddress from 'src/features/Linodes/LinodesLanding/IPAddress';
import Paper from 'src/components/core/Paper';
import { Typography } from 'src/components/Typography';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { Link, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import { useRegionsQuery } from 'src/queries/regions';
import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';

export const SummaryPanel = () => {
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);
  const { data: configs } = useAllNodeBalancerConfigsQuery(id);
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === nodebalancer?.region);

  const { mutateAsync: updateNodeBalancer } = useNodebalancerUpdateMutation(id);

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
          <StyledTitle variant="h3" data-qa-title>
            NodeBalancer Details
          </StyledTitle>
          <StyledSection>
            <Typography variant="body1" data-qa-ports>
              <strong>Ports: </strong>
              {configPorts?.length === 0 && 'None'}
              {configPorts?.map(({ port, configId }, i) => (
                <React.Fragment key={configId}>
                  <Link
                    to={`/nodebalancers/${nodebalancer?.id}/configurations/${configId}`}
                    className="secondaryLink"
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
            <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
              <strong>Host Name: </strong>
              {nodebalancer.hostname}
            </Typography>
          </StyledSection>
          <StyledSection>
            <Typography variant="body1" data-qa-region>
              <strong>Region:</strong> {region?.label}
            </Typography>
          </StyledSection>
        </StyledSummarySection>
      </StyledSummarySectionWrapper>
      <StyledSummarySection>
        <StyledTitle variant="h3" data-qa-title>
          IP Addresses
        </StyledTitle>
        <StyledSection>
          <StyledIPGrouping data-qa-ip>
            {nodebalancer?.ipv4 && (
              <IPAddress ips={[nodebalancer?.ipv4]} showMore />
            )}
            {nodebalancer?.ipv6 && <IPAddress ips={[nodebalancer?.ipv6]} />}
          </StyledIPGrouping>
        </StyledSection>
      </StyledSummarySection>
      <StyledSummarySection>
        <StyledTitle variant="h3" data-qa-title>
          Tags
        </StyledTitle>
        <TagsPanel
          tags={nodebalancer?.tags}
          updateTags={(tags) => updateNodeBalancer({ tags })}
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
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  minHeight: '160px',
  height: '93%',
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
    position: 'relative',
    width: 'auto',
    '& .chip': {
      position: 'absolute',
      top: '-4px',
      right: -10,
    },
  },
}));

const StyledIPGrouping = styled('div', {
  label: 'StyledIPGrouping',
})(() => ({
  margin: '-2px 0 0 2px',
  display: 'flex',
  flexDirection: 'column',
}));
