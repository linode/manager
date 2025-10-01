import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
  SUMMARY_PRIVATE_HOST_LEGACY_COPY,
} from '../constants';
import { getReadOnlyHost, isLegacyDatabase } from '../utilities';
import { ConnectionDetailsRow } from './ConnectionDetailsRow';
import { useStyles } from './DatabaseSummary/DatabaseSummaryConnectionDetails.style';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface ConnectionDetailsHostRowsProps {
  database: Database;
}

/**
 * This component is responsible for conditionally rendering the Private Host, Public Host, and Read-only Host rows that get displayed in
 * the Connection Details tables that appear in the Database Summary and Networking tabs */
export const ConnectionDetailsHostRows = (
  props: ConnectionDetailsHostRowsProps
) => {
  const { database } = props;
  const { classes } = useStyles();

  const sxTooltipIcon = {
    marginLeft: '4px',
    padding: '0px',
  };

  const hostTooltipComponentProps = {
    tooltip: {
      style: {
        minWidth: 285,
      },
    },
  };

  const isLegacy = isLegacyDatabase(database);
  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database?.private_network?.public_access;

  const getHostContent = (
    mode: 'default' | 'private' | 'public' = 'default'
  ) => {
    const hasPrimaryHostname = !!database.hosts?.primary;
    let primaryHostName = database.hosts?.primary;

    if (mode === 'public' && hasPrimaryHostname) {
      // Remove 'private-' substring at the beginning of the hostname and replace it with 'public-'
      const privateStrIndex = database.hosts.primary.indexOf('-');
      const baseHostName = database.hosts.primary.slice(privateStrIndex + 1);
      primaryHostName = `public-${baseHostName}`;
    }

    return hasPrimaryHostname ? (
      <>
        {primaryHostName}
        <CopyTooltip
          className={classes.inlineCopyToolTip}
          text={primaryHostName}
        />
        {!isLegacy && (
          <TooltipIcon
            componentsProps={hostTooltipComponentProps}
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={
              mode === 'private'
                ? SUMMARY_PRIVATE_HOST_COPY
                : SUMMARY_HOST_TOOLTIP_COPY
            }
          />
        )}
      </>
    ) : (
      <Typography>
        <span className={classes.provisioningText}>
          Your hostname will appear here once it is available.
        </span>
      </Typography>
    );
  };

  const getReadOnlyHostContent = () => {
    const defaultValue = isLegacy ? '-' : 'N/A';
    const value = getReadOnlyHost(database) || defaultValue;
    const hasHost = value !== '-' && value !== 'N/A';
    return (
      <>
        {value}
        {value && hasHost && (
          <CopyTooltip className={classes.inlineCopyToolTip} text={value} />
        )}
        {isLegacy && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={SUMMARY_PRIVATE_HOST_LEGACY_COPY}
          />
        )}
        {!isLegacy && hasHost && (
          <TooltipIcon
            componentsProps={hostTooltipComponentProps}
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={SUMMARY_HOST_TOOLTIP_COPY}
          />
        )}
      </>
    );
  };

  return (
    <>
      <ConnectionDetailsRow label={hasVPC ? 'Private Host' : 'Host'}>
        {getHostContent(hasVPC ? 'private' : 'default')}
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow label="Public Host">
          {getHostContent('public')}
        </ConnectionDetailsRow>
      )}
      <ConnectionDetailsRow
        label={isLegacy ? 'Private Network Host' : 'Read-only Host'}
      >
        {getReadOnlyHostContent()}
      </ConnectionDetailsRow>
    </>
  );
};
