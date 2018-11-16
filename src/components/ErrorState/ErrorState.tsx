import ErrorOutline from '@material-ui/icons/ErrorOutline';
import * as classNames from 'classnames';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Props {
  errorText: string;
  compact?: boolean;
}

type CSSClasses = 'root' | 'iconContainer' | 'icon' | 'compact';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
        <Typography role="header" variant="subheading" data-qa-error-msg>
          {props.errorText}
        </Typography>
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(ErrorState);
