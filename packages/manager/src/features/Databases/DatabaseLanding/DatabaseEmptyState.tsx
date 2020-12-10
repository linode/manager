import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import DatabaseIcon from 'src/assets/icons/entityIcons/bucket.svg';

interface Props {
  openAddDatabaseDrawer?: () => void;
}

const FirewallEmptyState: React.FC<Props> = props => {
  const { openAddDatabaseDrawer } = props;
  return (
    <Placeholder
      title={'Databases'}
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
