import { WithStyles } from '@material-ui/core/styles';
import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import { v4 } from 'uuid';
import CloseSnackbar from './CloseSnackbar';

type ClassNames = 'root' | 'info' | 'success' | 'error' | 'warning';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    info: {
      backgroundColor: theme.bg.white,
      borderLeftColor: theme.palette.primary.main
    },
    success: {
      backgroundColor: theme.bg.white,
      borderLeftColor: theme.palette.primary.main
    },
    error: {
      backgroundColor: theme.bg.white,
      borderLeftColor: theme.palette.status.errorDark
    },
    warning: {
      backgroundColor: theme.bg.white,
      borderLeftColor: theme.palette.status.warningDark
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
          variantInfo: classes.info
        }}
        action={<CloseSnackbar uuid={v4()} text="Dismiss Notification" />}
      >
        {children}
      </SnackbarProvider>
    );
  }
}

const styled = withStyles(styles);

export default styled(SnackBar);
