import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';

import MenuItem, { MenuItemProps } from 'material-ui/Menu/MenuItem';

type CSSClasses = 'root'
  | 'toolTip';

interface Props {
  tooltip?: string;
  className?: string;
}

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    position: 'relative',
  },
  toolTip: {
    display: 'block',
    width: '100%',
  },
});

type CombinedProps = MenuItemProps & Props & WithStyles<CSSClasses>;

const WrapperMenuItem: React.StatelessComponent<CombinedProps> = (props) => {
  const { tooltip, classes, className, ...rest } = props;

  return (
    <MenuItem {...rest} className={`${classes.root} ${className}`}>
      {tooltip && <span className={classes.toolTip}>{tooltip}</span>}
      {props.children}
    </MenuItem>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(WrapperMenuItem);
