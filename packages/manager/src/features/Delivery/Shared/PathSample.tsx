import { streamType, type StreamType } from '@linode/api-v4';
import { useProfile } from '@linode/queries';
import { Box, InputLabel, TooltipIcon } from '@linode/ui';
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
  [streamType.LKEAuditLogs]: 'com.akamai.audit.k8s',
  [streamType.AuditLogs]: 'com.akamai.audit.login',
};

interface PathSampleProps {
  value: string;
}

export const PathSample = (props: PathSampleProps) => {
  const { value } = props;
  const fileName = 'akamai_log-000166-1756015362-319597.gz';
  const sampleClusterId = useMemo(
    // eslint-disable-next-line sonarjs/pseudo-random
    () => Math.floor(Math.random() * 90000) + 10000,
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

  const { data: profile } = useProfile();
  const [month, day, year] = new Date().toLocaleDateString().split('/');

  const setStreamType = (): StreamType => {
    return streamTypeFormValue ?? streamType.AuditLogs;
  };

  const streamTypeValue = useMemo(setStreamType, [streamTypeFormValue]);

  const createSamplePath = (): string => {
    let partition = '';

    if (streamTypeValue === streamType.LKEAuditLogs) {
      partition = `${clusterId ?? sampleClusterId}/`;
    }

    return `/${streamTypeValue}/${logType[streamTypeValue]}/${profile?.uid}/${partition}${year}/${month}/${day}`;
  };

  const defaultPath = useMemo(createSamplePath, [
    profile,
    streamTypeValue,
    clusterId,
  ]);

  return (
    <Box display="flex" flexDirection="column">
      <InputLabel>
        Destination object name sample
        <TooltipIcon
          status="info"
          sxTooltipIcon={sxTooltipIcon}
          text={`Default paths: ${getStreamTypeOption(streamType.LKEAuditLogs)?.label} - {stream_type}/{log_type}/{account}/{partition}/{%Y/%m/%d/};
            ${getStreamTypeOption(streamType.AuditLogs)?.label} - {stream_type}/{log_type}/{account}/{%Y/%m/%d/}`}
        />
      </InputLabel>
      <StyledValue>
        {value || defaultPath}/{fileName}
      </StyledValue>
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
}));
