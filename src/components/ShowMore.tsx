import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Popover from 'material-ui/Popover';

type CSSClasses =  'chip' | 'label' | 'popover';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  chip: {
    height: theme.typography.body1.fontSize,
    marginLeft: theme.spacing.unit / 2,
  },
  label: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  popover: {
    padding: theme.spacing.unit * 2,
  },
});

interface Props<T> {
  items: T[];
  render: (items: T[]) => any;
}

class ShowMore<T> extends React.Component<Props<T> & WithStyles<CSSClasses> > {
  state = {
    anchorEl: undefined,
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes, render, items } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={classes.chip}
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
            vertical: 18,
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {render(items)}
        </Popover>
      </React.Fragment>
    );
  }
}

export default withStyles<CSSClasses>(styles, { withTheme: true })(ShowMore);
