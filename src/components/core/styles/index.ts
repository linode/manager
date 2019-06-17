import { WithStyles as _WithStyles } from '@material-ui/core/styles';
import { WithTheme as _WithTheme } from '@material-ui/core/styles';

/* tslint:disable-next-line:no-empty-interface */
export interface WithStyles<P extends string> extends _WithStyles<P> {}

/* tslint:disable-next-line:no-empty-interface */
export interface WithTheme extends _WithTheme {}

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
