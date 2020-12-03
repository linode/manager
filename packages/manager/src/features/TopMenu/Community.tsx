import Community from '@material-ui/icons/Forum';
import * as React from 'react';
import Link from 'src/components/Link';
import { useStyles } from './iconStyles';

export const Help: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Link
      aria-label="Link to Linode Community site"
      className={classes.icon}
      to="https://linode.com/community"
    >
      <Community />
    </Link>
  );
};

export default React.memo(Help);
