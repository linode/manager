import ErrorOutline from '@material-ui/icons/ErrorOutline';
import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Props {
  errorText: string | JSX.Element;
  compact?: boolean;
  cozy?: boolean;
}

type CSSClasses = 'root' | 'iconContainer' | 'icon' | 'compact' | 'cozy';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    padding: theme.spacing(10)
  },
  compact: {
    padding: theme.spacing(5)
  },
  cozy: {
    padding: theme.spacing(1)
  },
  iconContainer: {
    textAlign: 'center'
  },
  icon: {
    marginBottom: theme.spacing(2),
    color: theme.color.red,
    width: 50,
    height: 50
  }
});

const ErrorState = (props: Props & WithStyles<CSSClasses>) => {
  return (
    <Grid
      container
      className={classNames({
        [props.classes.root]: true,
        [props.classes.compact]: props.compact,
        [props.classes.cozy]: !!props.cozy
      })}
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <div className={props.classes.iconContainer}>
          <ErrorOutline className={props.classes.icon} data-qa-error-icon />
        </div>
        <Typography
          style={{ textAlign: 'center' }}
          variant="h3"
          data-qa-error-msg
        >
          {props.errorText}
        </Typography>
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ErrorState);
