import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Collapse from 'material-ui/transitions/Collapse';

import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';

type CSSClasses = 'root' | 'panel' | 'header';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    flex: 1,
  },
  header: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  panel: {
    padding: theme.spacing.unit,
  },
});

interface Props {
  name: string;
}

interface State {
  open: boolean;
}

type FinalProps = Props & WithStyles<CSSClasses>;

class ExpandPanel extends React.Component<FinalProps, State> {
  state = {
    open: false,
  };

  handleNameClick = () => {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { name, classes, children } = this.props;
    const { open } = this.state;

    return (
      <React.Fragment>
        <div className={classes.root}>
          <div className={classes.header} onClick={this.handleNameClick}>
            {open 
              ? <KeyboardArrowDown />
              : <KeyboardArrowRight />
            }
            {name}
          </div>
          <Collapse in={open}>
            {open
              ? (
                <div className={classes.panel}>
                  {children}
                </div>
              )
              : null
            }
          </Collapse>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ExpandPanel);
