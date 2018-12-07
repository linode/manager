import { SnackbarProvider, SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type CSSClasses =  'root';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  root: {},
});

type CombinedProps = SnackbarProviderProps & WithStyles<CSSClasses>;

class SnackBar extends React.Component<CombinedProps> {
  
  render() {
    const { children } = this.props;

    return (
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        maxSnack={3}
        autoHideDuration={40000}
        data-qa-toast
        classes={{
          root: 'poo',
          variantSuccess: 'success',
          variantError: 'error',
          variantWarning: 'warning',
          variantInfo: 'info',
        }}
      >
        {children}
      </SnackbarProvider>
    );
  }
}

export default withStyles<CSSClasses>(styles)(SnackBar);
