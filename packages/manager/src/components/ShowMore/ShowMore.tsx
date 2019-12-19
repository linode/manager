import * as classNames from 'classnames';
import * as React from 'react';
import Chip, { ChipProps } from 'src/components/core/Chip';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';

type CSSClasses = 'chip' | 'label' | 'popover' | 'link';

const styles = (theme: Theme) =>
  createStyles({
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
      maxHeight: 200,
      overflowY: 'scroll',
      padding: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        maxWidth: 285
      },
      '&::-webkit-scrollbar': {
        webkitAppearance: 'none',
        width: 7
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        backgroundColor: theme.color.grey2,
        WebkitBoxShadow: '0 0 1px rgba(255,255,255,.5)'
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

  // handleClick = (event: React.MouseEvent<HTMLElement>) => {
  //   event.preventDefault();
  //   const ariaAttr = event.currentTarget.getAttribute('aria-describedby');
  //   const tooltipEl = document.getElementById(ariaAttr!);
  //   this.setState({
  //     anchorEl: event.currentTarget
  //   });
  //   tooltipEl && tooltipEl.focus();
  // };

  // handleClose = (event: React.MouseEvent<HTMLElement>) => {
  //   event.preventDefault();
  //   this.setState({ anchorEl: undefined });
  // };

  render() {
    const { classes, render, items, chipProps } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Tooltip
          title={<React.Fragment>{render(items)}</React.Fragment>}
          interactive
        >
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
            // onClick={this.handleClick}
            {...chipProps}
            data-qa-show-more-chip
            component={'button' as 'div'}
            clickable
          />
        </Tooltip>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(ShowMore);
