import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Collapse from 'material-ui/transitions/Collapse';

import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';

type CSSClasses = 'root' | 'panel' | 'header' | 'caret' ;

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: `${theme.spacing.unit}px 0`,
  },
  header: {
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
  },
  caret: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing.unit,
    fontSize: '26px',
    transition: 'transform .1s ease-in-out',
    '&.rotate': {
      transition: 'transform .3s ease-in-out',
      transform: 'rotate(90deg)',
    },
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
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const { name, classes, children } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <div className={`${classes.header} ${open ? 'hOpen' : '' }`} onClick={this.handleNameClick}>
          {open
            ? <KeyboardArrowRight className={classes.caret + ' rotate'} />
            : <KeyboardArrowRight className={classes.caret}  />
          }
          {name}
        </div>
        <Collapse in={open} className={open ? 'pOpen' : ''}>
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
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ExpandPanel);
