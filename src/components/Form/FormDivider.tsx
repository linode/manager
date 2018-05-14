import * as React from 'react';

import Divider, { DividerProps } from 'material-ui/Divider';
import { Theme, withStyles, StyleRulesCallback, WithStyles } from 'material-ui';


type ClassNames = 'root';

interface Props extends DividerProps {
  line?: boolean;
  spacing?: number;
}

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => {
  return {
    root: {},
  };
};

type CombinedProps = Props & WithStyles<ClassNames>;

const FormDivider: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, line, spacing, ...rest } = props;

  return (
    <Divider
      className={classes.root}
      style={{
        marginTop: spacing,
        marginBottom: spacing,
        backgroundColor: line === false && 'transparent',
      }}
      {...rest}
    />
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(FormDivider);
