import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import SvgIcon from 'material-ui/SvgIcon';

type CSSClasses = 'root' | 'text';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'inline-block',
  },
  text: {

  },
});

interface Props {
  SideIcon: typeof SvgIcon;
  text: string;
  to?: string;
  onClick?: () => void;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const IconTextLink: React.StatelessComponent<FinalProps> = (props) => {
  const { SideIcon, classes, text, to, onClick } = props;

  return (
    <div className={classes.root}>
      <SideIcon />
      {to &&
        <Link to={to} className={classes.text}>
          {text}
        </Link>
      }
      {onClick &&
        <span onClick={onClick} className={classes.text}>
          {text}
        </span>
      }
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(IconTextLink);
