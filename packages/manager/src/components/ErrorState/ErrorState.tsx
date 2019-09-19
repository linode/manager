import ErrorOutline from '@material-ui/icons/ErrorOutline';
import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  SvgIconProps,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Props {
  errorText: string | JSX.Element;
  compact?: boolean;
  cozy?: boolean;
  CustomIcon?: React.ComponentType<SvgIconProps>;
  CustomIconStyles?: React.CSSProperties;
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
  const { CustomIcon } = props;
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
          {CustomIcon ? (
            <CustomIcon
              className={props.classes.icon}
              data-qa-error-icon
              style={props.CustomIconStyles}
            />
          ) : (
            <ErrorOutline className={props.classes.icon} data-qa-error-icon />
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

const styled = withStyles(styles);

export default styled(ErrorState);
