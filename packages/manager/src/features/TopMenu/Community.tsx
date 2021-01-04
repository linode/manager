import * as React from 'react';
import * as classNames from 'classnames';
import Community from 'src/assets/icons/community_nav.svg';
import Link from 'src/components/Link';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';

export const Help: React.FC<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  return (
    <Link
      aria-label="Link to Linode Community site"
      className={classNames(className, { [classes.icon]: true })}
      to="https://linode.com/community"
    >
      <TopMenuIcon title="Linode Cloud Community">
        <Community />
      </TopMenuIcon>
    </Link>
  );
};

export default React.memo(Help);
