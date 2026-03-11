import { TooltipIcon } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
} from '../constants';

import type { HostEndpoint } from '@linode/api-v4/lib/databases/types';

interface ConnectionDetailsHostDisplayProps {
  host: HostEndpoint;
}

export const ConnectionDetailsHostDisplay = (
  props: ConnectionDetailsHostDisplayProps
) => {
  const { host } = props;

  return (
    <>
      {host?.address}
      <StyledCopyTooltip text={host.address} />
      <TooltipIcon
        componentsProps={{
          tooltip: {
            style: {
              minWidth: 285,
            },
          },
        }}
        status="info"
        sxTooltipIcon={{
          marginLeft: '4px',
          padding: '0px',
        }}
        text={
          !host?.public_access
            ? SUMMARY_PRIVATE_HOST_COPY
            : SUMMARY_HOST_TOOLTIP_COPY
        }
      />
    </>
  );
};

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  '& svg': {
    height: theme.spacingFunction(16),
    width: theme.spacingFunction(16),
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
  display: 'inline-flex',
  marginLeft: theme.spacingFunction(4),
}));
