import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';

const useStyles = makeStyles(() => ({
  root: {
    '& svg': {
      transform: 'scale(0.8)',
    },
  },
  entityDescription: {
    marginBottom: '1rem',
  },
}));

const DatabaseEmptyState: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <>
      <DismissibleBanner
        preferenceKey="dbaas-open-beta-notice"
        productInformationIndicator
      >
        <Typography>
          Managed Database for MySQL is available in a free, open beta period.
          This is a beta environment and should not be used to support
          production workloads. Review the{' '}
          <Link to="https://www.linode.com/legal-eatp">
            Early Adopter Program SLA
          </Link>
          .
        </Typography>
      </DismissibleBanner>
      <Placeholder
        title="Databases"
        className={classes.root}
        icon={DatabaseIcon}
        isEntity
        buttonProps={[
          {
            onClick: () => history.push('/databases/create'),
            children: 'Create Database Cluster',
          },
        ]}
      >
        <Typography variant="subtitle1">
          <div className={classes.entityDescription}>
            Fully managed and highly scalable Database Clusters. Choose your
            Linode plan, select a database engine, and deploy in minutes.
          </div>
          <Link to="https://www.linode.com/docs/products/databases/managed-databases/">
            Need help getting started? Browse database guides.
          </Link>
        </Typography>
      </Placeholder>
    </>
  );
};

export default React.memo(DatabaseEmptyState);
