import * as React from 'react';
import { StickyProps } from 'react-sticky';
import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import LinodeTheme from 'src/theme';

type ClassNames = 'root' | 'sidebarTitle';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    minHeight: '24px',
    minWidth: '24px',
    padding: '12px',
    border: '1px solid black',
    backgroundColor: '#fff',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
  },
});

interface Props {
  onDeploy: () => void;
  label: string | null;
}

type CombinedProps = Props & StickyProps & WithStyles<ClassNames>;

class CheckoutBar extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      style,
      onDeploy,
      label,
    } = this.props;
    return (
      <div className={classes.root} style={style} onClick={onDeploy}>
        <Typography variant="title" className={classes.sidebarTitle}>
          {label || 'Linode'} Summary
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(CheckoutBar);
