import * as React from 'react';
import HelpIcon from 'src/components/HelpIcon';
import { reportException } from 'src/exceptionReporting';
import {
  createStyles,
  withStyles,
  WithStyles,
  Theme,
} from 'src/components/core/styles';

type ClassNames = 'errorIcon';

const styles = (theme: Theme) =>
  createStyles({
    errorIcon: {
      color: theme.color.red,
      marginRight: -20,
      '&:hover': {
        color: theme.color.red,
        opacity: 0.7,
      },
      '& svg': {
        height: 28,
        width: 28,
      },
    },
  });

interface State {
  error: boolean;
}

type Props = WithStyles<ClassNames>;

class PayPalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError(error: unknown) {
    reportException('Error occured when initializing PayPal with Braintree', {
      error,
    });
    return { error: true };
  }

  render() {
    const { error } = this.state;
    const { classes } = this.props;

    if (error) {
      return (
        <HelpIcon
          className={classes.errorIcon}
          isError={true}
          size={35}
          text="Error initializing PayPal."
        />
      );
    }

    return this.props.children;
  }
}

const styled = withStyles(styles);

export default styled(PayPalErrorBoundary);
