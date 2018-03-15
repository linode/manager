import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Popover from 'material-ui/Popover';

import LinodeTheme from 'src/theme';

type CSSClasses =  'chip' | 'label' | 'popover';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  chip: {
    height: 20,
    marginLeft: theme.spacing.unit / 2,
    backgroundColor: LinodeTheme.bg.lightBlue,
    fontWeight: 500,
    '&:hover, &.active': {
      backgroundColor: LinodeTheme.palette.primary.main,
      color: 'white',
    },
    '&:focus': {
      backgroundColor: LinodeTheme.bg.lightBlue,
    },
  },
  label: {
    paddingLeft: 6,
    paddingRight: 6,
    fontSize: '.75rem',
  },
  popover: {
    padding: theme.spacing.unit * 2,
    boxShadow: '0 0 5px #ddd',
  },
});

interface Props<T> {
  items: T[];
  render: (items: T[]) => any;
}

class ShowMore<T> extends React.Component<Props<T> & WithStyles<CSSClasses> > {
  state = {
    anchorEl: undefined,
    classes: this.props.classes.chip,
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
      classes: this.props.classes.chip + ' active',
    });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined, classes: this.props.classes.chip });
  }

  render() {
    const { classes, render, items } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={this.state.classes}
          label={`+${items.length}`}
          classes={{ label: classes.label }}
          onClick={this.handleClick}
        />
        <Popover
          classes={{ paper: classes.popover }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 28,
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {render(items)}
        </Popover>
      </React.Fragment>
    );
  }
}

export default withStyles<CSSClasses>(styles, { withTheme: true })(ShowMore);
