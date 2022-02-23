import classNames from 'classnames';
import * as React from 'react';
import Chip, { ChipProps } from 'src/components/core/Chip';
import Popover from 'src/components/core/Popover';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type CSSClasses = 'chip' | 'label' | 'popover' | 'link';

const styles = (theme: Theme) =>
  createStyles({
    chip: {
      position: 'relative',
      marginLeft: theme.spacing(1) / 2,
      paddingLeft: 2,
      paddingRight: 2,
      backgroundColor: theme.bg.lightBlue1,
      fontWeight: 500,
      lineHeight: 1,
      '&:hover, &.active': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue1,
        outline: '1px dotted #999',
      },
    },
    label: {
      paddingLeft: 6,
      paddingRight: 6,
    },
    link: {
      color: `${theme.color.blueDTwhite} !important`,
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    popover: {
      minWidth: 'auto',
      maxWidth: 400,
      maxHeight: 200,
      overflowY: 'scroll',
      padding: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        maxWidth: 285,
      },
      '&::-webkit-scrollbar': {
        webkitAppearance: 'none',
        width: 7,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        backgroundColor: theme.color.grey2,
        WebkitBoxShadow: '0 0 1px rgba(255,255,255,.5)',
      },
    },
  });

interface Props<T> {
  items: T[];
  render: (items: T[]) => any;
  chipProps?: ChipProps;
  ariaItemType: string;
}

export class ShowMore<T> extends React.Component<
  Props<T> & WithStyles<CSSClasses>
> {
  state = {
    anchorEl: undefined,
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { classes, render, items, chipProps, ariaItemType } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={classNames(
            {
              [classes.chip]: true,
              active: anchorEl,
            },
            'chip'
          )}
          label={`+${items.length}`}
          aria-label={`+${items.length} ${ariaItemType}`}
          classes={{ label: classes.label }}
          onClick={this.handleClick}
          {...chipProps}
          data-qa-show-more-chip
          component={'button' as 'div'}
          clickable
        />

        <Popover
          classes={{ paper: classes.popover }}
          role="dialog"
          aria-label={`${items.length} additional ${ariaItemType}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 28,
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

export default withStyles(styles)(ShowMore);
