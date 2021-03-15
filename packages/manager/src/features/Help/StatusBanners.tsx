import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import {
  IncidentImpact,
  IncidentStatus,
  useIncidentQuery,
  useMaintenanceQuery,
} from 'src/queries/statusPage';
import { capitalize } from 'src/utilities/capitalize';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(),
    paddingLeft: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: theme.spacing(),
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
  },
  text: {
    fontSize: '1rem',
    lineHeight: '1.3rem',
  },
  header: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(),
  },
}));

export const StatusBanners: React.FC<{}> = (_) => {
  const { data: incidentsData } = useIncidentQuery();
  const incidents = incidentsData?.incidents.slice(0, 2) ?? [];

  const { data: maintenanceData } = useMaintenanceQuery();
  // To get both upcoming and active maintenance events in one request, we
  // use the endpoint that returns everything. We then filter out anything that's completed.
  const maintenance = (maintenanceData?.scheduled_maintenances ?? []).filter(
    (thisMaintenance) => thisMaintenance.status !== 'completed'
  );

  if (incidents.length === 0 && maintenance.length === 0) {
    return null;
  }

  return (
    // eslint-disable-next-line
    <>
      {incidents.map((thisIncident) => {
        const mostRecentUpdate = thisIncident.incident_updates[0];
        return (
          <IncidentBanner
            key={thisIncident.id}
            title={thisIncident.name}
            message={mostRecentUpdate.body}
            status={thisIncident.status}
            impact={thisIncident.impact}
            href={thisIncident.shortlink}
          />
        );
      })}
      {maintenance.map((thisMaintenance) => {
        const mostRecentUpdate = thisMaintenance.incident_updates[0]; // Usually there's only one of these anyway
        return (
          <IncidentBanner
            key={thisMaintenance.id}
            title={thisMaintenance.name}
            message={mostRecentUpdate.body}
            impact={thisMaintenance.impact}
            href={thisMaintenance.shortlink}
          />
        );
      })}
    </>
  );
};

interface IncidentProps {
  message: string;
  title: string;
  // Maintenance events have statuses but we don't need to display them
  status?: IncidentStatus;
  href: string;
  impact: IncidentImpact;
}

export const IncidentBanner: React.FC<IncidentProps> = React.memo((props) => {
  const { message, status: _status, title, impact, href } = props;
  const status = _status ?? '';
  const classes = useStyles();

  const [hidden, setHidden] = React.useState(false);

  if (hidden) {
    return null;
  }

  const handleDismiss = () => {
    setHidden(true);
  };

  return (
    <Notice
      important
      warning={
        ['maintenance', 'major', 'minor', 'none'].includes(impact) ||
        ['monitoring', 'resolved'].includes(status)
      }
      error={impact === 'critical'}
      className={classes.root}
      dismissible
      onClose={handleDismiss}
    >
      <Typography className={classes.header}>
        <Link to={href}>
          <strong>
            {title}
            {status ? `: ${capitalize(status)}` : ''}
          </strong>
        </Link>
      </Typography>
      <Typography
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(message) }}
        className={classes.text}
      />
    </Notice>
  );
});

export default React.memo(StatusBanners);
