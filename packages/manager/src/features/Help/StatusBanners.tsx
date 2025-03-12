import { Box, Typography } from '@linode/ui';
import { capitalize, truncateEnd } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { useIncidentQuery } from 'src/queries/statusPage';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { IncidentImpact, IncidentStatus } from 'src/queries/statusPage';

export const StatusBanners = () => {
  const { data: incidentsData } = useIncidentQuery();
  const incidents = incidentsData?.incidents ?? [];

  if (incidents.length === 0) {
    return null;
  }

  return (
    // eslint-disable-next-line
    <>
      {incidents.map((thisIncident) => {
        const mostRecentUpdate = thisIncident.incident_updates.filter(
          (thisUpdate) => thisUpdate.status !== 'postmortem'
        )[0];
        return (
          <IncidentBanner
            href={thisIncident.shortlink}
            impact={thisIncident.impact}
            key={thisIncident.id}
            message={mostRecentUpdate?.body ?? ''}
            status={thisIncident.status}
            title={thisIncident.name}
          />
        );
      })}
    </>
  );
};

export interface IncidentProps {
  href: string;
  impact: IncidentImpact;
  message: string;
  // Maintenance events have statuses but we don't need to display them
  status?: IncidentStatus;
  title: string;
}

export const IncidentBanner = React.memo((props: IncidentProps) => {
  const { href, impact, message, status: _status, title } = props;
  const status = _status ?? '';
  const theme = useTheme();

  const preferenceKey = `${href}-${status}`;
  const variantMap = {
    error:
      impact === 'critical' && !['monitoring', 'resolved'].includes(status),
    warning:
      ['major', 'minor', 'none'].includes(impact) ||
      ['monitoring', 'resolved'].includes(status),
  };

  return (
    <DismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 1 }).toISO(),
        label: preferenceKey,
      }}
      variant={
        variantMap.error ? 'error' : variantMap.warning ? 'warning' : undefined
      }
      important
      preferenceKey={preferenceKey}
      sx={{ marginBottom: theme.spacing() }}
    >
      <Box display="flex" flexDirection="column">
        <Typography
          sx={{
            fontSize: '1rem',
            marginBottom: theme.spacing(),
          }}
          data-testid="status-banner"
        >
          <Link to={href}>
            <strong data-testid="incident-status">
              {title}
              {status ? `: ${capitalize(status)}` : ''}
            </strong>
          </Link>
        </Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML({
              sanitizingTier: 'flexible',
              text: truncateEnd(message, 500),
            }),
          }}
          sx={{
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
          }}
        />
      </Box>
    </DismissibleBanner>
  );
});
