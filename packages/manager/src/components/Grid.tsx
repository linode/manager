// A grid component using the following libs as inspiration.
//
// For the implementation:
// - https://getbootstrap.com/docs/4.3/layout/grid/
// - https://github.com/kristoferjoseph/flexboxgrid/blob/master/src/css/flexboxgrid.css
// - https://github.com/roylee0704/react-flexbox-grid
// - https://material.angularjs.org/latest/layout/introduction
//
// Follow this flexbox Guide to better understand the underlying model:
// - https://css-tricks.com/snippets/css/a-guide-to-flexbox/

import { Breakpoint } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import clsx from 'clsx';
import * as React from 'react';

import { breakpoints } from 'src/foundations/breakpoints';

import type { GridProps } from '@mui/material/Grid';

const SPACINGS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const GRID_SIZES = ['auto', true, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function generateGrid(globalStyles: any, breakpoint: Breakpoint) {
  const styles = {};

  GRID_SIZES.forEach((size) => {
    const key = `grid-${breakpoint}-${size}`;

    if (size === true) {
      // For the auto layouting
      styles[key] = {
        flexBasis: 0,
        flexGrow: 1,
        maxWidth: '100%',
      };
      return;
    }

    if (size === 'auto') {
      styles[key] = {
        flexBasis: 'auto',
        flexGrow: 0,
        maxWidth: 'none',
      };
      return;
    }

    // Keep 7 significant numbers.
    const width = `${Math.round(((size as number) / 12) * 10e7) / 10e5}%`;

    // Close to the bootstrap implementation:
    // https://github.com/twbs/bootstrap/blob/8fccaa2439e97ec72a4b7dc42ccc1f649790adb0/scss/mixins/_grid.scss#L41
    styles[key] = {
      flexBasis: width,
      flexGrow: 0,
      maxWidth: width,
    };
  });

  // No need for a media query for the first size.
  if (breakpoint === 'xs') {
    Object.assign(globalStyles, styles);
  } else {
    globalStyles[breakpoints.up(breakpoint)] = styles;
  }
}

function getOffset(val: number, div = 1) {
  const parse = val;
  return `${parse / div}${String(val).replace(String(parse), '') || 'px'}`;
}

function generateGutter(breakpoint: Breakpoint) {
  const styles = {};

  SPACINGS.forEach((spacing) => {
    const themeSpacing = 8 * spacing;

    if (themeSpacing === 0) {
      return;
    }

    styles[`spacing-${breakpoint}-${spacing}`] = {
      '& > $item': {
        padding: getOffset(themeSpacing, 2),
      },
      margin: `-${getOffset(themeSpacing, 2)}`,
      width: `calc(100% + ${getOffset(themeSpacing)})`,
    };
  });

  return styles;
}

// Default CSS values
// flex: '0 1 auto',
// flexDirection: 'row',
// alignItems: 'flex-start',
// flexWrap: 'nowrap',
// justifyContent: 'flex-start',
export const styles = (theme: Theme) => ({
  /* Styles applied to the root element if `alignContent="center"`. */
  'align-content-xs-center': {
    alignContent: 'center',
  },
  /* Styles applied to the root element if `alignContent="flex-end"`. */
  'align-content-xs-flex-end': {
    alignContent: 'flex-end',
  },
  /* Styles applied to the root element if `alignContent="flex-start"`. */
  'align-content-xs-flex-start': {
    alignContent: 'flex-start',
  },
  /* Styles applied to the root element if `alignContent="space-around"`. */
  'align-content-xs-space-around': {
    alignContent: 'space-around',
  },
  /* Styles applied to the root element if `alignContent="space-between"`. */
  'align-content-xs-space-between': {
    alignContent: 'space-between',
  },
  /* Styles applied to the root element if `alignItems="baseline"`. */
  'align-items-xs-baseline': {
    alignItems: 'baseline',
  },
  /* Styles applied to the root element if `alignItems="center"`. */
  'align-items-xs-center': {
    alignItems: 'center',
  },
  /* Styles applied to the root element if `alignItems="flex-end"`. */
  'align-items-xs-flex-end': {
    alignItems: 'flex-end',
  },
  /* Styles applied to the root element if `alignItems="flex-start"`. */
  'align-items-xs-flex-start': {
    alignItems: 'flex-start',
  },
  /* Styles applied to the root element if `container={true}`. */
  container: {
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  /* Styles applied to the root element if `direction="column"`. */
  'direction-xs-column': {
    flexDirection: 'column',
  },
  /* Styles applied to the root element if `direction="column-reverse"`. */
  'direction-xs-column-reverse': {
    flexDirection: 'column-reverse',
  },
  /* Styles applied to the root element if `direction="row-reverse"`. */
  'direction-xs-row-reverse': {
    flexDirection: 'row-reverse',
  },
  /* Styles applied to the root element if `item={true}`. */
  item: {
    boxSizing: 'border-box',
    margin: '0', // For instance, it's useful when used with a `figure` element.
  },
  /* Styles applied to the root element if `justifyContent="center"`. */
  'justify-content-xs-center': {
    justifyContent: 'center',
  },
  /* Styles applied to the root element if `justifyContent="flex-end"`. */
  'justify-content-xs-flex-end': {
    justifyContent: 'flex-end',
  },
  /* Styles applied to the root element if `justifyContent="space-around"`. */
  'justify-content-xs-space-around': {
    justifyContent: 'space-around',
  },
  /* Styles applied to the root element if `justifyContent="space-between"`. */
  'justify-content-xs-space-between': {
    justifyContent: 'space-between',
  },
  /* Styles applied to the root element if `justifyContent="space-evenly"`. */
  'justify-content-xs-space-evenly': {
    justifyContent: 'space-evenly',
  },
  /* Styles applied to the root element. */
  root: {},
  /* Styles applied to the root element if `wrap="nowrap"`. */
  'wrap-xs-nowrap': {
    flexWrap: 'nowrap',
  },
  /* Styles applied to the root element if `wrap="reverse"`. */
  'wrap-xs-wrap-reverse': {
    flexWrap: 'wrap-reverse',
  },
  /* Styles applied to the root element if `zeroMinWidth={true}`. */
  zeroMinWidth: {
    minWidth: 0,
  },
  ...generateGutter('xs'),
  ...breakpoints.keys.reduce((accumulator, key) => {
    // Use side effect over immutability for better performance.
    generateGrid(accumulator, key);
    return accumulator;
  }, {}),
});

const _Grid = React.forwardRef<any, GridProps>(function Grid(
  props: GridProps & { classes: any },
  ref
) {
  const {
    alignContent = 'stretch',
    alignItems = 'stretch',
    className: classNameProp,
    classes,
    container = false,
    direction = 'row',
    item = false,
    justifyContent = 'flex-start',
    lg = false,
    md = false,
    sm = false,
    spacing = 0,
    wrap = 'wrap',
    xl = false,
    xs = false,
    zeroMinWidth = false,
    ...other
  } = props;

  const className = clsx(
    classes.root,
    {
      [classes.container]: container,
      [classes.item]: item,
      [classes.zeroMinWidth]: zeroMinWidth,
      [classes[`align-content-xs-${String(alignContent)}`]]:
        alignContent !== 'stretch',
      [classes[`align-items-xs-${String(alignItems)}`]]:
        alignItems !== 'stretch',
      [classes[`direction-xs-${String(direction)}`]]: direction !== 'row',
      [classes[`grid-lg-${String(lg)}`]]: lg !== false,
      [classes[`grid-md-${String(md)}`]]: md !== false,
      [classes[`grid-sm-${String(sm)}`]]: sm !== false,
      [classes[`grid-xl-${String(xl)}`]]: xl !== false,
      [classes[`grid-xs-${String(xs)}`]]: xs !== false,
      [classes[`justify-content-xs-${String(justifyContent)}`]]:
        justifyContent !== 'flex-start',
      [classes[`spacing-xs-${String(spacing)}`]]: container && spacing !== 0,
      [classes[`wrap-xs-${String(wrap)}`]]: wrap !== 'wrap',
    },
    classNameProp
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 😣
  return <div className={className} ref={ref} {...other} />;
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 😣
export const Grid = withStyles(styles, { name: 'MuiGrid' })(_Grid);

export type { GridProps };
