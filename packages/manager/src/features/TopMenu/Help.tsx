import * as React from 'react';
import TooltipIcon from 'src/assets/icons/get_help.svg';
import Link from 'src/components/Link';
import { useStyles } from './iconStyles';
import TopMenuIcon from './TopMenuIcon';
import { TOOLTIP_ICON_STATUS } from 'src/components/TooltipIcon/TooltipIcon';

export const Help: React.FC<{}> = (_) => {
  const classes = useStyles();

  return (
    <Link
      aria-label="Link to Linode Support"
      className={classes.icon}
      to="/support"
    >
      <TopMenuIcon title={'Help & Support'}>
        <TooltipIcon status={TOOLTIP_ICON_STATUS.HELP} />
      </TopMenuIcon>
    </Link>
  );
};

export default React.memo(Help);
