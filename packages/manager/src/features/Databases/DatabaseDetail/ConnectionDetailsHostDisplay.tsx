import { Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
} from '../constants';
import { CopyTooltip } from '../shared/CopyTooltip/CopyTooltip';

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
      <CopyTooltip text={host.address} />
      <Tooltip
        style={{ marginLeft: Spacing.S4 }}
        tooltipPlacement="bottom"
        tooltipText={
          !host?.public_access
            ? SUMMARY_PRIVATE_HOST_COPY
            : SUMMARY_HOST_TOOLTIP_COPY
        }
      >
        <Icon icon="info-outline" size="m" />
      </Tooltip>
    </>
  );
};
