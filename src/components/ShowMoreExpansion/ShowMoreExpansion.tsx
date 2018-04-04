import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Collapse from 'material-ui/transitions/Collapse';

import { ListItem } from 'material-ui/List';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import LinodeTheme from '../../../src/theme';


type CSSClasses = 'root' | 'header' | 'caret' ;

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      '& $caret, & $header': {
        color: theme.palette.primary.light,
      },
    },
  },
  header: {
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    color: LinodeTheme.color.headline,
    transition: 'color 225ms ease-in-out',
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

class ShowMoreExpansion extends React.Component<CombinedProps, State> {
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
      <ListItem
        className={classes.root}
        button
        onClick={this.handleNameClick}
        disableRipple
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        role="menu"
        data-qa-show-more-expanded={open ? 'true' : 'false'}
        >
        <div className={`${classes.header} ${open ? 'hOpen' : '' }`} data-qa-show-more-toggle>
          {open
            ? <KeyboardArrowRight className={classes.caret + ' rotate'} />
            : <KeyboardArrowRight className={classes.caret}  />
          }
          <span>{name}</span>
        </div>
        <Collapse in={open} className={open ? 'pOpen' : ''}>
          {open
            ? (
              <div>
                {children}
              </div>
            )
            : null
          }
        </Collapse>
      </ListItem>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ShowMoreExpansion);
