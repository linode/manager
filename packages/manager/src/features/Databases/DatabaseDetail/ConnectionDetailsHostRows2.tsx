import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
} from '../constants';
import { ConnectionDetailsRow } from './ConnectionDetailsRow';
import { useStyles } from './DatabaseSummary/DatabaseSummaryConnectionDetails.style';

import type {
  Database,
  HostEndpoint,
} from '@linode/api-v4/lib/databases/types';

interface ConnectionDetailsHostRowsProps {
  database: Database;
  isSummaryTab?: boolean;
}

/**
 * This component is responsible for conditionally rendering the Private Host, Public Host, and Read-only Host rows that get displayed in
 * the Connection Details tables that appear in the Database Summary and Networking tabs */
export const ConnectionDetailsHostRows2 = (
  props: ConnectionDetailsHostRowsProps
) => {
  const { database, isSummaryTab } = props;
  const { classes } = useStyles();

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database?.private_network?.public_access;

  const getHostDisplay = (host: HostEndpoint) => {
    return (
      <>
        {host?.address}
        <CopyTooltip
          className={classes.inlineCopyToolTip}
          text={host.address}
        />
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

  const getPrimaryHostContent = (mode?: 'private' | 'public') => {
    const isPublic = mode === 'private' ? false : true;
    const primaryHost = database.hosts?.endpoints.find(
      (endpoint) =>
        endpoint.role === 'primary' && endpoint.public_access === isPublic
    );

    if (!primaryHost) {
      return (
        <Typography>
          <span className={classes.provisioningText}>
            Your hostname will appear here once it is available.
          </span>
        </Typography>
      );
    }

    return getHostDisplay(primaryHost);
  };

  const getReadOnlyHostContent = (mode?: 'private' | 'public') => {
    const isPublic = mode === 'private' ? false : true;
    const readOnlyHost = database.hosts?.endpoints.find(
      (endpoint) =>
        endpoint.role === 'standby' && endpoint.public_access === isPublic
    );

    if (!readOnlyHost) {
      return 'N/A';
    }

    return getHostDisplay(readOnlyHost);
  };

  return (
    <>
      <ConnectionDetailsRow
        isSummaryTab={isSummaryTab}
        label={hasVPC ? 'Private Host' : 'Host'}
      >
        {getPrimaryHostContent(hasVPC ? 'private' : 'public')}
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow isSummaryTab={isSummaryTab} label="Public Host">
          {getPrimaryHostContent('public')}
        </ConnectionDetailsRow>
      )}
      <ConnectionDetailsRow
        isSummaryTab={isSummaryTab}
        label={hasVPC ? 'Private Read-only Host' : 'Read-only Host'}
      >
        {getReadOnlyHostContent(hasVPC ? 'private' : 'public')}
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow
          isSummaryTab={isSummaryTab}
          label="Public Read-only Host"
        >
          {getReadOnlyHostContent('public')}
        </ConnectionDetailsRow>
      )}
    </>
  );
};
