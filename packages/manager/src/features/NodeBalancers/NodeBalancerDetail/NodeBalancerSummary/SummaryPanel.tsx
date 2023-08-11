import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link, useParams } from 'react-router-dom';

import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';
import { useRegionsQuery } from 'src/queries/regions';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

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
          <StyledTitle data-qa-title variant="h3">
            NodeBalancer Details
          </StyledTitle>
          <StyledSection>
            <Typography data-qa-ports variant="body1">
              <strong>Ports: </strong>
              {configPorts?.length === 0 && 'None'}
              {configPorts?.map(({ configId, port }, i) => (
                <React.Fragment key={configId}>
                  <Link
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
