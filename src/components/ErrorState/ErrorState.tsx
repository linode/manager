import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Grid from 'src/components/Grid';

import ErrorOutline from 'material-ui-icons/ErrorOutline';


interface Props {
  errorText: string;
  compact?: boolean;
}

type CSSClasses = 'root' | 'iconContainer' | 'icon' | 'compact';

const styles: StyleRulesCallback<CSSClasses> = (theme: Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 10,
  },
  compact: {
    padding: theme.spacing.unit * 5,
  },
  iconContainer: {
    textAlign: 'center',
  },
  icon: {
    marginBottom: theme.spacing.unit * 2,
    color: theme.color.red,
    width: 50,
    height: 50,
  },
});

const ErrorState = (props: Props & WithStyles<CSSClasses>) => {
  return (
    <Grid
      container
      className={classNames({
        [props.classes.root]: true,
        [props.classes.compact]: props.compact,
      })}
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <div className={props.classes.iconContainer}>
          <ErrorOutline className={props.classes.icon} data-qa-error-icon/>
        </div>
        <Typography variant="subheading" data-qa-error-msg>
          {props.errorText}
        </Typography>
      </Grid>
    </Grid>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(ErrorState);
