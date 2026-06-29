import { Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import {
  SUMMARY_HOST_TOOLTIP_COPY,
  SUMMARY_PRIVATE_HOST_COPY,
  SUMMARY_PRIVATE_HOST_LEGACY_COPY,
} from '../constants';
import { CopyTooltip } from '../shared/CopyTooltip/CopyTooltip';
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
  isSummaryTab?: boolean;
}

type HostContentMode = 'default' | 'private' | 'public';

/**
 * @deprecated Delete this file in favor of ConnectionDetailsHostRows2 after the API releases hostname endpoint changes.
 *
 * This component is responsible for conditionally rendering the Private Host, Public Host, and Read-only Host rows that get displayed in
 * the Connection Details tables that appear in the Database Summary and Networking tabs */
export const ConnectionDetailsHostRows = (
  props: ConnectionDetailsHostRowsProps
) => {
  const { database, isSummaryTab } = props;
  const { classes } = useStyles();

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
            <Tooltip
              tooltipPlacement="bottom"
              tooltipText={
                mode === 'private'
                  ? SUMMARY_PRIVATE_HOST_COPY
                  : SUMMARY_HOST_TOOLTIP_COPY
              }
            >
              <Icon
                icon="info-outline"
                size="m"
                style={{ marginLeft: Spacing.S4 }}
              />
            </Tooltip>
          )}
        </>
      );
    }

    return (
      <span className={classes.provisioningText}>
        Your hostname will appear here once it is available.
      </span>
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
          <Tooltip
            tooltipPlacement="bottom"
            tooltipText={SUMMARY_PRIVATE_HOST_LEGACY_COPY}
          >
            <Icon
              icon="info-outline"
              size="m"
              style={{ marginLeft: Spacing.S4 }}
            />
          </Tooltip>
        )}
        {!isLegacy && hasHost && (
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipPlacement="bottom"
            tooltipText={
              mode === 'private'
                ? SUMMARY_PRIVATE_HOST_COPY
                : SUMMARY_HOST_TOOLTIP_COPY
            }
          >
            <Icon icon="info-outline" size="m" />
          </Tooltip>
        )}
      </>
    );
  };

  const readonlyHostLabel = isLegacy
    ? 'Private Network Host'
    : 'Read-only Host';

  return (
    <>
      <ConnectionDetailsRow
        isSummaryTab={isSummaryTab}
        label={hasVPC ? 'Private Host' : 'Host'}
      >
        {getHostContent(hasVPC ? 'private' : 'default')}
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow isSummaryTab={isSummaryTab} label="Public Host">
          {getHostContent('public')}
        </ConnectionDetailsRow>
      )}
      <ConnectionDetailsRow
        isSummaryTab={isSummaryTab}
        label={hasVPC ? 'Private Read-only Host' : readonlyHostLabel}
      >
        {getReadOnlyHostContent(hasVPC ? 'private' : 'default')}
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
