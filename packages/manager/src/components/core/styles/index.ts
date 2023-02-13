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

export type { Theme } from '@mui/material/styles/createTheme';

export { default as useMediaQuery } from '@mui/material/useMediaQuery';
