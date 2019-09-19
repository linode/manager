import {
  WithStyles as _WithStyles,
  WithTheme as _WithTheme
} from '@material-ui/core/styles';
import { SvgIconProps as _SVGIconProps } from '@material-ui/core/SvgIcon';
import { CSSProperties as _CSSProperties } from '@material-ui/styles';

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
  useTheme
} from '@material-ui/styles';

export { createMuiTheme } from '@material-ui/core/styles';

export { Theme } from '@material-ui/core/styles/createMuiTheme';
