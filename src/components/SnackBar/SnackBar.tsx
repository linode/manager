import { SnackbarClassKey } from '@material-ui/core/Snackbar';
import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type CSSClasses =  'root'
  | 'info'
  | 'success'
  | 'error'
  | 'warning';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  root: {
  },
  info: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.primary.main,
  },
  success: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.primary.main,
  },
  error: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.status.errorDark,
  },
  warning: {
    backgroundColor: theme.bg.white,
    borderLeftColor: theme.palette.status.warningDark,
  }
});

type CombinedProps = SnackbarProviderProps & WithStyles<CSSClasses>;

class SnackBar extends React.Component<CombinedProps> {
  
  render() {
    const { children, classes, ...rest } = this.props;

    return (
      <SnackbarProvider
        {...rest}
        classes={{
          root: classes.root,
          variantSuccess: classes.success,
          variantError: classes.error,
          variantWarning: classes.warning,
          variantInfo: classes.info,
          /** implicitly typing this as Snackbar key value pairs from MUI */
        } as Partial<Record<SnackbarClassKey, string>>}
      >
        {children}
      </SnackbarProvider>
    );
  }
}

export default withStyles<CSSClasses>(styles)(SnackBar);
