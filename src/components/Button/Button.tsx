import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button, { ButtonProps } from 'material-ui/Button';

type ClassNames = 'loading';

interface Props {
  loading?: boolean;
  className?: string;
}

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  loading: {},
});

type CombinedProps = ButtonProps & Props & WithStyles<ClassNames>;

const WrappedButton: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, className, loading, ...rest } = props;

  return (
    <Button {...rest} className={`
        ${loading && classes.loading}
        ${className}
      `}
    >
      {props.children}
    </Button>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(WrappedButton);
