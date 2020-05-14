import Backup from '@material-ui/icons/Backup';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { pluralize } from 'src/utilities/pluralize';
import DashboardCard from '../DashboardCard';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%'
  },
  header: {
    textAlign: 'center',
    fontSize: 18
  },
  icon: {
    color: theme.color.blueDTwhite,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
    fontSize: 32
  },
  itemTitle: {
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main
  },
  section: {
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  sectionLink: {
    cursor: 'pointer'
  },
  title: {
    background: theme.bg.tableHeader,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: `${theme.spacing(1)}px !important`
  },
  ctaLink: {
    display: 'block'
  }
}));

interface Props {
  accountBackups: boolean;
  linodesWithoutBackups: number;
  openBackupDrawer: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const BackupsDashboardCard: React.FC<CombinedProps> = props => {
  const { accountBackups, linodesWithoutBackups, openBackupDrawer } = props;

  const { _loading } = useReduxLoad(['linodes']);
  const classes = useStyles();

  const restricted = isRestrictedUser();

  if (restricted || (accountBackups && !linodesWithoutBackups)) {
    return null;
  }

  if (_loading) {
    return <CircleProgress />;
  }

  return (
    <DashboardCard data-qa-backups-dashboard-card>
      <Paper
        className={classNames({
          [classes.section]: true,
          [classes.title]: true
        })}
      >
        <Backup className={classes.icon} />
        <Typography className={classes.header} variant="h2">
          Back Up Your Data and Keep it Safe
        </Typography>
      </Paper>
      {!accountBackups && (
        <Link
          to="/account/settings"
          data-qa-account-link
          data-testid="account-link"
          className={classes.ctaLink}
        >
          <Paper
            className={classNames({
              [classes.section]: true,
              [classes.sectionLink]: true
            })}
          >
            <Typography variant="h3" className={classes.itemTitle}>
              Linode Backup Auto-Enrollment
            </Typography>
            <Typography variant="body1">
              If you enable this global setting, new Linodes will be
              automatically enrolled in the Backups service.
            </Typography>
          </Paper>
        </Link>
      )}
      {/* Only show this section if the user has Linodes without backups */}
      {Boolean(linodesWithoutBackups) && (
        <div
          onClick={openBackupDrawer}
          onKeyPress={openBackupDrawer}
          data-qa-backup-existing
          data-testid="back-up-existing-linodes"
          className={classes.ctaLink}
          role="button"
          tabIndex={0}
        >
          <Paper
            className={classNames({
              [classes.section]: true,
              [classes.sectionLink]: true
            })}
          >
            <Typography variant="h3" className={classes.itemTitle}>
              Enable Backups for Existing Linodes
            </Typography>
            <Typography variant="body1" data-qa-linodes-message>
              {`You currently have
                ${pluralize('Linode', 'Linodes', linodesWithoutBackups)}
                without backups. Enable backups to protect your data.`}
            </Typography>
          </Paper>
        </div>
      )}
    </DashboardCard>
  );
};

BackupsDashboardCard.displayName = 'BackupsDashboardCard';

const enhanced = compose<CombinedProps, Props>(withRouter)(
  BackupsDashboardCard
);

export default enhanced;
