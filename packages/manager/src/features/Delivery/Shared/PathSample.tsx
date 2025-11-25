import { streamType, type StreamType } from '@linode/api-v4';
import { useAccount } from '@linode/queries';
import { Box, InputLabel, Stack, TooltipIcon, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { getStreamTypeOption } from 'src/features/Delivery/deliveryUtils';

const sxTooltipIcon = {
  marginLeft: '4px',
  padding: '0px',
  marginTop: '-2px',
};

const logType = {
  [streamType.LKEAuditLogs]: 'k8s',
  [streamType.AuditLogs]: 'login',
};

interface PathSampleProps {
  value: string;
}

export const PathSample = (props: PathSampleProps) => {
  const { value } = props;
  const sampleClusterId = useMemo(
    // eslint-disable-next-line sonarjs/pseudo-random
    () => `lke${Math.floor(Math.random() * 90000) + 10000}`,
    []
  );

  const { control } = useFormContext();
  const streamTypeFormValue = useWatch({
    control,
    name: 'stream.type',
  });

  const clusterId = useWatch({
    control,
    name: 'stream.details.cluster_ids[0]',
  });

  const { data: account } = useAccount();
  const [month, day, year] = new Date().toLocaleDateString('en-US').split('/');

  const setStreamType = (): StreamType => {
    return streamTypeFormValue ?? streamType.AuditLogs;
  };

  const streamTypeValue = useMemo(setStreamType, [streamTypeFormValue]);
  const fileName = `akamai_log-000166-1756015362-319597-${logType[streamTypeValue]}.gz`;

  const createSamplePath = (): string => {
    let partition = '';

    if (streamTypeValue === streamType.LKEAuditLogs) {
      partition = `${clusterId ?? sampleClusterId}/`;
    }

    return `/${streamTypeValue}/com.akamai.audit/${account?.euuid}/${partition}${year}/${month}/${day}`;
  };

  const defaultPath = useMemo(createSamplePath, [
    account,
    streamTypeValue,
    clusterId,
  ]);

  const getPath = () => {
    if (value === '/') {
      return `/${fileName}`;
    }

    const path = `${value || defaultPath}/${fileName}`;

    if (!path.startsWith('/')) {
      return `/${path}`;
    }

    return path;
  };

  return (
    <Box display="flex" flexDirection="column">
      <InputLabel>
        Sample Destination Object Name
        <TooltipIcon
          status="info"
          sxTooltipIcon={sxTooltipIcon}
          text={
            <Stack spacing={2}>
              <Typography>Default paths:</Typography>
              <Typography>{`${getStreamTypeOption(streamType.LKEAuditLogs)?.label} - {stream_type}/{log_type}/ {account}/{partition}/ {%Y/%m/%d/}`}</Typography>
              <Typography>{`${getStreamTypeOption(streamType.AuditLogs)?.label} - {stream_type}/{log_type}/ {account}/{%Y/%m/%d/}`}</Typography>
            </Stack>
          }
        />
      </InputLabel>
      <StyledValue>{getPath()}</StyledValue>
    </Box>
  );
};

const StyledValue = styled('span', { label: 'StyledValue' })(({ theme }) => ({
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  width: '100%',
  maxWidth: 'max-content',
  minHeight: 34,
  padding: theme.spacingFunction(8),
  overflowWrap: 'anywhere',
  wordBreak: 'break-all',
}));
