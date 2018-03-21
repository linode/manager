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
    maxWidth: `calc(415px + ${theme.spacing.unit}px)`,
  },
  block: {
    backgroundColor: '#C9CACB',
    height: '4px',
    transition: 'background-color .5s ease-in-out',
  },
  0 : { backgroundColor: '#BF332B !important' },
  1 : { backgroundColor: '#BF332B !important' },
  2 : { backgroundColor: '#4EAD62 !important' },
  3 : { backgroundColor: '#4EAD62 !important' },
  4 : { backgroundColor: '#4EAD62 !important' },
});

const styled = withStyles<ClassNames>(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<ClassNames>;

const StrengthIndicator: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, strength } = props;
  return (
    <Grid container spacing={8} className={classes.root}>
      {
        Array
          .from(Array(4))
          .map((v, idx) => (
            <Grid item
              key={idx}
              xs={3}
            >
            <div className={classNames({
              [classes.block]: true,
              [classes[strength]]: idx <= strength,
            })}></div>
            </Grid>
          ))
      }
    </Grid>
  );
};

export default styled(StrengthIndicator);
