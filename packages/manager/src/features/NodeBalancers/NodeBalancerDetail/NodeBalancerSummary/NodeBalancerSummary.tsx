import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Stack from '@mui/material/Stack';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { useRegionsQuery } from 'src/queries/regions';
import { formatDate } from 'src/utilities/formatDate';
import { parseAPIDate } from 'src/utilities/date';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import {
  useAllNodeBalancerConfigsWithNodesQuery,
  useNodeBalancerQuery,
  useNodeBalancerStats,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';

export const NodeBalancerSummary = () => {
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const theme = useTheme();
  const history = useHistory();
  const { data: nodebalancer } = useNodeBalancerQuery(id);
  const { data: regions } = useRegionsQuery();
  const { data: stats } = useNodeBalancerStats(id);
  const { data: configs } = useAllNodeBalancerConfigsWithNodesQuery(id);
  const { mutateAsync: updateNodeBalancer } = useNodebalancerUpdateMutation(id);

  const region = regions?.find((r) => r.id === nodebalancer?.region);

  const nodebalancerNode = {
    id: String(nodebalancer?.id),
    position: { x: 0, y: 0 },
    data: {
      label: nodebalancer?.label,
    },
  };

  const configNodes =
    configs?.map((config, idx) => ({
      id: String(config.id),
      position: { x: idx * 100, y: 100 },
      data: {
        onClick: () =>
          history.push(`/nodebalancers/${id}/configurations/${config.id}`),
        label: `${config.port} ${config.protocol.toUpperCase()}`,
      },
    })) ?? [];

  const nodes =
    configs
      ?.map((config) =>
        config.nodes.map((node, idx) => ({
          id: String(node.id),
          position: { x: idx * 200, y: 200 },
          data: {
            onClick: () =>
              history.push(`/nodebalancers/${id}/configurations/${config.id}`),
            label: (
              <Stack alignItems="center" spacing={1}>
                <div>{node.label}</div>
                <div>
                  {/* @ts-expect-error not true */}
                  {node.address}:{node.port}
                </div>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <div>{node.status}</div>
                  <StatusIcon
                    status={node.status === 'UP' ? 'active' : 'error'}
                  />
                </Stack>
              </Stack>
            ),
          },
        }))
      )
      .flat() ?? [];

  const configEdges =
    configs?.map((config) => ({
      id: `nobal-to-${config.id}`,
      source: String(nodebalancer?.id),
      target: String(config.id),
      animated: true,
    })) ?? [];

  const nodeEdges =
    configs
      ?.map((config) =>
        config.nodes.map((node) => ({
          id: `${config.id}-to-${node.id}`,
          source: String(config.id),
          target: String(node.id),
          animated: true,
        }))
      )
      .flat() ?? [];

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment={`${nodebalancer?.label} - Summary`} />
      <Paper sx={{ paddingBottom: 1 }}>
        <Stack direction="row" columnGap={4} rowGap={2} flexWrap="wrap">
          <Stack>
            <Typography variant="h2">Region</Typography>
            <Typography>{region?.label}</Typography>
          </Stack>
          <Stack>
            <Typography variant="h2">IPv4</Typography>
            <Typography>{nodebalancer?.ipv4}</Typography>
          </Stack>
          <Stack>
            <Typography variant="h2">IPv6</Typography>
            <Typography>{nodebalancer?.ipv6}</Typography>
          </Stack>
          <Stack>
            <Typography variant="h2">Hostname</Typography>
            <Typography>{nodebalancer?.hostname}</Typography>
          </Stack>
          <Stack>
            <Typography variant="h2">Created</Typography>
            <Typography>{formatDate(nodebalancer?.created ?? '')}</Typography>
          </Stack>
          <Stack>
            <Typography variant="h2">Updated</Typography>
            <Typography>
              {parseAPIDate(nodebalancer?.updated ?? '').toRelative()}
            </Typography>
          </Stack>
        </Stack>
        <Box mt={2}>
          <TagsPanel
            tags={nodebalancer?.tags ?? []}
            updateTags={(tags) => updateNodeBalancer({ tags })}
          />
        </Box>
      </Paper>
      <Paper sx={{ height: 250, padding: 0 }}>
        <Typography
          position="absolute"
          variant="h2"
          paddingTop={2}
          paddingLeft={2}
        >
          Connections
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={stats?.data.connections.map(([x, y]) => ({
              time: x,
              value: y,
            }))}
          >
            <XAxis dataKey="time" scale="time" hide />
            <Tooltip wrapperStyle={{ outline: 'none' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#85b4f2"
              fill="#85b4f2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ height: 250, padding: 0 }}>
        <Typography
          position="absolute"
          variant="h2"
          paddingTop={2}
          paddingLeft={2}
        >
          Traffic
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={stats?.data.traffic.in.map(([x, y]) => ({
              time: x,
              in: y,
              out:
                stats?.data.traffic.out.find((item) => item[0] === x)?.[1] ?? 0,
            }))}
          >
            <XAxis dataKey="time" scale="time" hide />
            <Tooltip wrapperStyle={{ outline: 'none' }} />
            <Area
              type="monotone"
              dataKey="in"
              stroke="#85b4f2"
              fill="#85b4f2"
            />
            <Area
              type="monotone"
              dataKey="out"
              stroke={theme.color.blue}
              fill={theme.color.blue}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ height: 550, padding: 0 }}>
        <Typography
          position="absolute"
          variant="h2"
          paddingTop={2}
          paddingLeft={2}
        >
          Topology
        </Typography>
        <ReactFlow
          nodes={[nodebalancerNode, ...configNodes, ...nodes]}
          edges={[...configEdges, ...nodeEdges]}
          onNodeClick={(data, node) => node.data.onClick()}
        />
      </Paper>
    </Stack>
  );
};
