import * as React from 'react';
import { StickyProps } from 'react-sticky';
import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    minHeight: '24px',
    minWidth: '24px',
    padding: '12px',
    border: '1px solid black',
    backgroundColor: '#fff',
  },
});

interface Props {
  onDeploy: () => void;
}

type CombinedProps = Props & StickyProps & WithStyles<'root'>;

class CheckoutBar extends React.Component<CombinedProps> {
  render() {
    const { classes, style, onDeploy } = this.props;
    return (
      <div className={classes.root} style={style} onClick={onDeploy}>
        I'm sticky!!
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(CheckoutBar);
