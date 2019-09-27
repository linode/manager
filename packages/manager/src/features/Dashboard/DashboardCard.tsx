import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'container' | 'headerAction';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    container: {
      marginTop: theme.spacing(3)
    },
    headerAction: {
      position: 'relative',
      top: 6,
      left: -theme.spacing(2),
      marginLeft: theme.spacing(1) / 2
    }
  });

interface Props {
  title?: string;
  className?: string;
  alignHeader?: 'flex-start' | 'space-between';
  alignItems?: 'center' | 'flex-start';
  headerAction?: () => JSX.Element | JSX.Element[] | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DashboardCard: React.StatelessComponent<CombinedProps> = props => {
  const {
    alignHeader,
    title,
    headerAction,
    classes,
    className,
    alignItems
  } = props;
  return (
    <Grid
      container
      className={classNames(className, {
        [classes.container]: true
      })}
      data-qa-card={title}
    >
      {(title || headerAction) && (
        <Grid item xs={12}>
          <Grid
            container
            alignItems={alignItems || 'flex-start'}
            justify={alignHeader || 'space-between'}
          >
            {title && (
              <Grid item className={'py0'}>
                <Typography variant="h2">{title}</Typography>
              </Grid>
            )}
            {headerAction && (
              <Grid item className={'py0'}>
                <Typography variant="body1" className={classes.headerAction}>
                  {headerAction()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        {props.children}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(DashboardCard);
