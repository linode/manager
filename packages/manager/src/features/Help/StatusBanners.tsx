import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import DismissibleBanner from 'src/components/DismissibleBanner';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import {
  IncidentImpact,
  IncidentStatus,
  useIncidentQuery,
} from 'src/queries/statusPage';
import { capitalize } from 'src/utilities/capitalize';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { truncateEnd } from 'src/utilities/truncate';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
  },
  header: {
    fontSize: '1rem',
    marginBottom: theme.spacing(),
  },
  root: {
    marginBottom: theme.spacing(),
  },
  text: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
}));

export const StatusBanners: React.FC<{}> = (_) => {
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

export const IncidentBanner: React.FC<IncidentProps> = React.memo((props) => {
  const { href, impact, message, status: _status, title } = props;
  const status = _status ?? '';
  const classes = useStyles();

  const preferenceKey = `${href}-${status}`;

  return (
    <DismissibleBanner
      error={
        impact === 'critical' && !['monitoring', 'resolved'].includes(status)
      }
      options={{
        expiry: DateTime.utc().plus({ days: 1 }).toISO(),
        label: preferenceKey,
      }}
      warning={
        ['major', 'minor', 'none'].includes(impact) ||
        ['monitoring', 'resolved'].includes(status)
      }
      className={classes.root}
      important
      preferenceKey={preferenceKey}
    >
      <Box display="flex" flexDirection="column">
        <Typography className={classes.header} data-testid="status-banner">
          <Link to={href}>
            <strong data-testid="incident-status">
              {title}
              {status ? `: ${capitalize(status)}` : ''}
            </strong>
          </Link>
        </Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(truncateEnd(message, 500)),
          }}
          className={classes.text}
        />
      </Box>
    </DismissibleBanner>
  );
});

export default React.memo(StatusBanners);
