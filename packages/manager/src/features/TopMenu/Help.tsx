import * as React from 'react';
import HelpIcon from 'src/assets/primary-nav-help.svg';
import Link from 'src/components/Link';
import { useStyles } from './iconStyles';

export const Help: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Link
      aria-label="Link to Linode Support"
      className={classes.icon}
      to="/support"
    >
      <HelpIcon />
    </Link>
  );
};

export default React.memo(Help);
