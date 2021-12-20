import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& svg': {
      marginTop: theme.spacing(1.5),
      transform: 'scale(0.8)',
    },
  },
}));

const DatabaseEmptyState: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Placeholder
      title={'Databases'}
      className={classes.root}
      icon={DatabaseIcon}
      isEntity
      buttonProps={[
        {
          onClick: () => history.push('/databases/create'),
          children: 'Create a Database Cluster',
        },
      ]}
    >
      <Typography variant="subtitle1">
        <div>Take control of your data with managed MySQL Databases.</div>
        <Link to="https://www.linode.com/docs">
          Get started with Databases.
        </Link>
      </Typography>
    </Placeholder>
  );
};

export default React.memo(DatabaseEmptyState);
