import { TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
  SUMMARY_PRIVATE_HOST_LEGACY_COPY,
} from '../constants';
import {
  convertPrivateToPublicHostname,
  getReadOnlyHost,
  isLegacyDatabase,
} from '../utilities';
import { ConnectionDetailsRow } from './ConnectionDetailsRow';
import { useStyles } from './DatabaseSummary/DatabaseSummaryConnectionDetails.style';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface ConnectionDetailsHostRowsProps {
  database: Database;
}

type HostContentMode = 'default' | 'private' | 'public';

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

  const isLegacy = isLegacyDatabase(database); // TODO (UIE-8214) POST GA - Remove legacy check and legacy content as it is no longer necessary
  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database?.private_network?.public_access;

  const getHostContent = (mode: HostContentMode = 'default') => {
    let primaryHostName = database.hosts?.primary;

    if (mode === 'public' && primaryHostName) {
      primaryHostName = convertPrivateToPublicHostname(primaryHostName);
    }

    if (primaryHostName) {
      return (
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
      );
    }

    return (
      <Typography>
        <span className={classes.provisioningText}>
          Your hostname will appear here once it is available.
        </span>
      </Typography>
    );
  };

  const getReadOnlyHostContent = (mode: HostContentMode = 'default') => {
    const defaultValue = isLegacy ? '-' : 'N/A';
    const hostValue = getReadOnlyHost(database) || defaultValue;
    const hasHost = hostValue !== '-' && hostValue !== 'N/A';
    const displayedHost =
      mode === 'public' && hasHost
        ? convertPrivateToPublicHostname(hostValue)
        : hostValue;
    return (
      <>
        {displayedHost}
        {displayedHost && hasHost && (
          <CopyTooltip
            className={classes.inlineCopyToolTip}
            text={displayedHost}
          />
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
            text={
              mode === 'private'
                ? SUMMARY_PRIVATE_HOST_COPY
                : SUMMARY_HOST_TOOLTIP_COPY
            }
          />
        )}
      </>
    );
  };

  const readonlyHostLabel = isLegacy
    ? 'Private Network Host'
    : 'Read-only Host';

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
        label={hasVPC ? 'Private Read-only Host' : readonlyHostLabel}
      >
        {getReadOnlyHostContent(hasVPC ? 'private' : 'default')}
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow label="Public Read-only Host">
          {getReadOnlyHostContent('public')}
        </ConnectionDetailsRow>
      )}
    </>
  );
};
