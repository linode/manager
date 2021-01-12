import * as React from 'react';
import HelpIcon from 'src/assets/icons/get_help.svg';
import Link from 'src/components/Link';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';

export const Help: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Link
      aria-label="Link to Linode Support"
      className={classes.icon}
      to="/support"
    >
      <TopMenuIcon title={'Help & Support'}>
        <HelpIcon />
      </TopMenuIcon>
    </Link>
  );
};

export default React.memo(Help);
