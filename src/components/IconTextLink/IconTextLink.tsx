import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import SvgIcon from 'material-ui/SvgIcon';

type CSSClasses = 'root' | 'active' | 'disabled';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'inline-block',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      color: '#4997f4',
    },
  },
  active: {
    color: '#1f64b6',
  },
  disabled: {
    color: '#939598',
    pointerEvents: 'none',
  },
});

interface Props {
  SideIcon: typeof SvgIcon;
  text: string;
  onClick: () => void;
  active?: Boolean;
  disabled?: Boolean;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const IconTextLink: React.StatelessComponent<FinalProps> = (props) => {
  const {
    SideIcon,
    classes,
    text,
    onClick,
    active,
    disabled,
  } = props;

  return (
    <div
      className={
        classNames({
          [classes.root]: true,
          [classes.disabled]: disabled === true,
          [classes.active]: active === true,
        })
      }
      onClick={onClick}
    >
      <SideIcon />
      <span>
        {text}
      </span>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(IconTextLink);
