import * as React from 'react';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import classNames from 'classnames';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { makeStyles, SvgIconProps, Theme } from 'src/components/core/styles';

interface Props {
  errorText: string | JSX.Element;
  compact?: boolean;
  cozy?: boolean;
  CustomIcon?: React.ComponentType<SvgIconProps>;
  CustomIconStyles?: React.CSSProperties;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(10),
  },
  compact: {
    padding: theme.spacing(5),
  },
  cozy: {
    padding: theme.spacing(1),
  },
  iconContainer: {
    textAlign: 'center',
  },
  icon: {
    marginBottom: theme.spacing(2),
    color: theme.color.red,
    width: 50,
    height: 50,
  },
}));

const ErrorState = (props: Props) => {
  const { CustomIcon } = props;
  const classes = useStyles();
  return (
    <Grid
      container
      className={classNames(classes.root, {
        [classes.compact]: props.compact,
        [classes.cozy]: !!props.cozy,
      })}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item data-testid="error-state">
        <div className={classes.iconContainer}>
          {CustomIcon ? (
            <CustomIcon
              className={classes.icon}
              data-qa-error-icon
              style={props.CustomIconStyles}
            />
          ) : (
            <ErrorOutline className={classes.icon} data-qa-error-icon />
          )}
        </div>
        {typeof props.errorText === 'string' ? (
          <Typography
            style={{ textAlign: 'center' }}
            variant="h3"
            data-qa-error-msg
          >
            {props.errorText}
          </Typography>
        ) : (
          <div style={{ textAlign: 'center' }}>{props.errorText}</div>
        )}
      </Grid>
    </Grid>
  );
};

export default ErrorState;
