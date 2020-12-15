import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& svg': {
      marginTop: theme.spacing(1.5),
      transform: 'scale(0.8)'
    }
  }
}));
interface Props {
  openAddDatabaseDrawer?: () => void;
}

const FirewallEmptyState: React.FC<Props> = props => {
  const classes = useStyles();

  const { openAddDatabaseDrawer } = props;
  return (
    <Placeholder
      title={'Databases'}
      className={classes.root}
      icon={DatabaseIcon}
      isEntity
      buttonProps={[
        {
          onClick: openAddDatabaseDrawer,
          children: 'Add a Database'
        }
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

export default React.memo(FirewallEmptyState);
