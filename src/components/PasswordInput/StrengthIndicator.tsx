import * as React from 'react';
import * as classNames from 'classnames';

import  {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Grid from 'material-ui/Grid';

interface Props {
  strength: 0 | 1 | 2 | 3 | 4;
}

type ClassNames = 'root' | 'block' | '0' | '1' | '2' | '3' | '4';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%',
  },
  block: {
    height: '4px',
    width: '91px',
    marginRight: theme.spacing.unit / 2,
  },
  0 : { backgroundColor: '#CF1E1E' },
  1 : { backgroundColor: '#CF1E1E' },
  2 : { backgroundColor: '#FFD000' },
  3 : { backgroundColor: '#00B159' },
  4 : { backgroundColor: '#00B159' },
});

const styled = withStyles<ClassNames>(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<ClassNames>;

const StrengthIndicator: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, strength } = props;
  return (
    <Grid container className={classes.root}>
      {
        Array
          .from(Array(4))
          .map((v, idx) => (
            <Grid item
              key={idx}
              className={classNames({
                [classes.block]: true,
                [classes[strength]]: idx <= strength,
              })}
            />
          ))
      }
    </Grid>
  );
};

export default styled(StrengthIndicator);
