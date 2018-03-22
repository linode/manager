import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Collapse from 'material-ui/transitions/Collapse';

import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import LinodeTheme from '../../../src/theme';


type CSSClasses = 'root' | 'panel' | 'header' | 'caret' ;

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: `${theme.spacing.unit}px 0`,
  },
  header: {
    marginBottom: theme.spacing.unit,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    color: LinodeTheme.color.headline,
  },
  caret: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing.unit / 2,
    fontSize: 28,
    transition: 'transform .1s ease-in-out',
    '&.rotate': {
      transition: 'transform .3s ease-in-out',
      transform: 'rotate(90deg)',
    },
  },
});

interface Props {
  name: string;
}

interface State {
  open: boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class ExpandPanel extends React.Component<CombinedProps, State> {
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
          <span>{name}</span>
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
