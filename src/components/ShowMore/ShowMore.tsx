import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Chip, { ChipProps } from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';

type CSSClasses =  'chip' | 'label' | 'popover';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  chip: {
    position: 'relative',
    top: -1,
    height: 20,
    marginLeft: theme.spacing.unit / 2,
    backgroundColor: theme.bg.lightBlue,
    fontWeight: 500,
    lineHeight: 1,
    '&:hover, &.active': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue,
      outline: '1px dotted #999',
    },
  },
  label: {
    paddingLeft: 6,
    paddingRight: 6,
    fontSize: '.75rem',
  },
  popover: {
    minWidth: 'auto',
    maxWidth: 400,
    overflow: 'visible',
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 285,
    },
  },
});

interface Props<T> {
  items: T[];
  render: (items: T[]) => any;
  chipProps?: ChipProps;
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
    const { classes, render, items, chipProps } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={this.state.classes}
          label={`+${items.length}`}
          classes={{ label: classes.label }}
          onClick={this.handleClick}
          {...chipProps}
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
