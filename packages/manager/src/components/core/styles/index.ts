import { Theme as _Theme } from '@mui/material/styles';
import { SvgIconProps as _SVGIconProps } from '@mui/material/SvgIcon';
import {
  WithStyles as _WithStyles,
  WithTheme as _WithTheme,
} from '@mui/styles';
import { CSSProperties as _CSSProperties } from '@mui/styles/withStyles';

/* tslint:disable-next-line:no-empty-interface */
export type SvgIconProps = _SVGIconProps;

export type WithStyles<P extends string> = _WithStyles<P>;

/* tslint:disable-next-line:no-empty-interface */
export type WithTheme = _WithTheme;

/* tslint:disable-next-line:no-empty-interface */
export type CSSProperties = _CSSProperties;

export {
  createGenerateClassName,
  createStyles,
  jssPreset,
  makeStyles,
  withStyles,
  withTheme,
  useTheme,
} from '@mui/styles';

export { createTheme, ThemeProvider } from '@mui/material/styles';

interface Theme extends _Theme {
  name: string;
  '@keyframes rotate': any;
  '@keyframes dash': any;
  bg: any;
  textColors: any;
  borderColors: any;
  color: any;
  graphs: any;
  visually: any;
  font?: any;
  animateCircleIcon?: any;
  addCircleHoverEffect?: any;
  applyLinkStyles?: any;
  applyStatusPillStyles?: any;
  applyTableHeaderStyles?: any;

  notificationList: any;
  status: any;
}

export { Theme };

export { default as useMediaQuery } from '@mui/material/useMediaQuery';
