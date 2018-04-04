import * as React from 'react';
import * as classNames from 'classnames';
import { isNil } from 'ramda';

import  {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Grid from 'src/components/Grid';

interface Props {
  strength: null | 0 | 1 | 2 | 3 | 4;
}
type ClassNames = 'root'
  | 'block'
  | 'strength-0'
  | 'strength-1'
  | 'strength-2'
  | 'strength-3'
  | 'strength-4';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    maxWidth: `calc(415px + ${theme.spacing.unit}px)`,
  },
  block: {
    backgroundColor: '#C9CACB',
    height: '4px',
    transition: 'background-color .5s ease-in-out',
  },
  'strength-0' : { backgroundColor: '#BF332B !important' },
  'strength-1' : { backgroundColor: '#BF332B !important' },
  'strength-2' : { backgroundColor: '#BF332B !important' },
  'strength-3' : { backgroundColor: '#4EAD62 !important' },
  'strength-4' : { backgroundColor: '#4EAD62 !important' },
});

const styled = withStyles<ClassNames>(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<ClassNames>;

const StrengthIndicator: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, strength } = props;
  return (
    <Grid container spacing={8} className={classes.root} data-qa-strength={strength}>
      {
        Array
          .from(Array(4), (v, idx) => idx + 1)
          .map(idx => (
            <Grid item
              key={idx}
              xs={3}
            >
            <div className={classNames({
              [classes.block]: true,
              [classes[`strength-${strength}`]]: !isNil(strength) && idx <= strength,
            })}></div>
            </Grid>
          ))
      }
    </Grid>
  );
};

export default styled(StrengthIndicator);
