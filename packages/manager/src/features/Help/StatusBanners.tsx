import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import {
  IncidentImpact,
  IncidentStatus,
  useIncidentQuery,
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

  if (incidents.length === 0) {
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
    </>
  );
};

interface IncidentProps {
  message: string;
  title: string;
  status: IncidentStatus;
  href: string;
  impact: IncidentImpact;
}

export const IncidentBanner: React.FC<IncidentProps> = React.memo((props) => {
  const { message, status, title, impact, href } = props;
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
        ['major', 'minor', 'none'].includes(impact) ||
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
            {title}: {capitalize(status)}
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
