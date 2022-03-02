import {
  WithStyles as _WithStyles,
  WithTheme as _WithTheme,
} from '@material-ui/core/styles';
import { SvgIconProps as _SVGIconProps } from '@material-ui/core/SvgIcon';
import { CSSProperties as _CSSProperties } from '@material-ui/styles';
import { Theme as _Theme } from '@material-ui/core/styles/createTheme';

/* tslint:disable-next-line:no-empty-interface */
export interface SvgIconProps extends _SVGIconProps {}

/* tslint:disable-next-line:no-empty-interface */
export interface WithStyles<P extends string> extends _WithStyles<P> {}

/* tslint:disable-next-line:no-empty-interface */
export interface WithTheme extends _WithTheme {}

/* tslint:disable-next-line:no-empty-interface */
export interface CSSProperties extends _CSSProperties {}

export {
  createGenerateClassName,
  createStyles,
  jssPreset,
  ThemeProvider,
  makeStyles,
  withStyles,
  withTheme,
  useTheme,
} from '@material-ui/styles';

export { createMuiTheme } from '@material-ui/core/styles';

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

export { default as useMediaQuery } from '@material-ui/core/useMediaQuery';
