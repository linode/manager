import * as React from 'react';

import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

type CSSClasses = 'root' 
| 'caret';

const styles: StyleRulesCallback = (theme) => ({
  root: {
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent !important',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    width: 'auto',
    color: theme.color.headline,
    transition: theme.transitions.create('color'),
    '&:hover': {
      color: theme.palette.primary.main,
      '& $caret': {
        color: theme.palette.primary.light,
      },
    },
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
      <React.Fragment>
        <Button
          className={classes.root}
          aria-haspopup="true"
          role="button"
          aria-expanded={open ? 'true' : 'false'}
          data-qa-show-more-expanded={open ? 'true' : 'false'}
          onClick={this.handleNameClick}
          data-qa-show-more-toggle
        >
          {open
            ? <KeyboardArrowRight className={classes.caret + ' rotate'} />
            : <KeyboardArrowRight className={classes.caret} />
          }
          <div>{name}</div>
        </Button>
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
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ShowMoreExpansion);
