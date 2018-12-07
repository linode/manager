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
    const { children, classes } = this.props;

    return (
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        maxSnack={3}
        autoHideDuration={400000}
        data-qa-toast
        hideIconVariant={true}
        classes={{
          root: classes.root,
          variantSuccess: classes.success,
          variantError: classes.error,
          variantWarning: classes.warning,
          variantInfo: classes.info,
        }}
      >
        {children}
      </SnackbarProvider>
    );
  }
}

export default withStyles<CSSClasses>(styles)(SnackBar);
