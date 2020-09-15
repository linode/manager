import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100% !important'
  },
  container: {
    marginTop: theme.spacing(3)
  },
  header: {
    padding: theme.spacing(3),
    paddingBottom: 0
  },
  headerAction: {
    position: 'relative',
    top: 6,
    left: -theme.spacing(2),
    marginLeft: theme.spacing(1) / 2
  }
}));

interface Props {
  title?: string;
  className?: string;
  alignHeader?: 'flex-start' | 'space-between';
  alignItems?: 'center' | 'flex-start';
  headerAction?: () => JSX.Element | JSX.Element[] | null;
  noHeaderActionStyles?: boolean;
}

type CombinedProps = Props;

const DashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    alignHeader,
    title,
    headerAction,
    noHeaderActionStyles,
    className,
    alignItems
  } = props;

  return (
    <Grid
      container
      className={classNames(className, {
        [classes.root]: true,
        [classes.container]: true
      })}
      data-qa-card={title}
    >
      {(title || headerAction) && (
        <Grid item xs={12}>
          <Grid
            container
            className={classes.header}
            alignItems={alignItems || 'flex-start'}
            justify={alignHeader || 'space-between'}
          >
            {title && (
              <Grid item className={'p0'}>
                <Typography variant="h2">{title}</Typography>
              </Grid>
            )}
            {headerAction && (
              <Grid item className={'p0'}>
                <Typography
                  variant="body1"
                  className={
                    !noHeaderActionStyles ? classes.headerAction : undefined
                  }
                >
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

export default DashboardCard;
