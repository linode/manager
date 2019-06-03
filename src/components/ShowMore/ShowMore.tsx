import * as classNames from 'classnames';
import * as React from 'react';
import Chip, { ChipProps } from 'src/components/core/Chip';
import Popover from 'src/components/core/Popover';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type CSSClasses = 'chip' | 'label' | 'popover' | 'link';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  chip: {
    position: 'relative',
    marginLeft: theme.spacing(1) / 2,
    paddingLeft: 2,
    paddingRight: 2,
    backgroundColor: theme.bg.lightBlue,
    fontWeight: 500,
    lineHeight: 1,
    '&:hover, &.active': {
      backgroundColor: theme.palette.primary.main,
      color: 'white'
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue,
      outline: '1px dotted #999'
    }
  },
  label: {
    paddingLeft: 6,
    paddingRight: 6
  },
  link: {
    color: `${theme.color.blueDTwhite} !important`,
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  popover: {
    minWidth: 'auto',
    maxWidth: 400,
    overflow: 'visible',
    padding: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      maxWidth: 285
    }
  }
});

interface Props<T> {
  items: T[];
  render: (items: T[]) => any;
  chipProps?: ChipProps;
}

export class ShowMore<T> extends React.Component<
  Props<T> & WithStyles<CSSClasses>
> {
  state = {
    anchorEl: undefined
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { classes, render, items, chipProps } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={classNames(
            {
              [classes.chip]: true,
              active: anchorEl
            },
            'chip'
          )}
          label={`+${items.length}`}
          classes={{ label: classes.label }}
          onClick={this.handleClick}
          {...chipProps}
          data-qa-show-more-chip
          component={'button' as 'div'}
          clickable
        />

        <Popover
          classes={{ paper: classes.popover }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 28,
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          {render(items)}
        </Popover>
      </React.Fragment>
    );
  }
}

export default withStyles<CSSClasses>(styles)(ShowMore);
