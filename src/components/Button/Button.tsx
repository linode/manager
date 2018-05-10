import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button, { ButtonProps } from 'material-ui/Button';
import Reload from 'src/assets/icons/reload.svg';

type ClassNames = 'loading';

interface Props extends ButtonProps {
  loading?: boolean;
  className?: string;
}

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  loading: {
    '& svg': {
      width: 22,
      height: 22,
      animation: 'rotate 2s linear infinite',
    },
  },
});

type CombinedProps =  Props & WithStyles<ClassNames>;

const WrappedButton: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, className, loading, ...rest } = props;

  return (
    <Button
      className={`
        ${loading && classes.loading}
        ${className}
      `}
      {...rest}
    >
      {loading
        ?
          <Reload />
        :
          props.children
      }
    </Button>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(WrappedButton);
