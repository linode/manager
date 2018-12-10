import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames =  'root'
  | 'info'
  | 'success'
  | 'error'
  | 'warning';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

type CombinedProps = SnackbarProviderProps & WithStyles<ClassNames>;

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
        }}
      >
        {children}
      </SnackbarProvider>
    );
  }
}

const styled = withStyles(styles);

export default styled(SnackBar);
