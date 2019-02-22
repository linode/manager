import * as classNames from 'classnames';
import * as React from 'react';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'container' | 'headerAction';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  container: {
    marginTop: theme.spacing.unit * 3
  },
  headerAction: {
    position: 'relative',
    top: theme.spacing.unit - 2,
    left: -theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit / 2
  }
});

interface Props {
  title?: string;
  className?: string;
  headerAction?: () => JSX.Element | JSX.Element[] | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DashboardCard: React.StatelessComponent<CombinedProps> = props => {
  const { title, headerAction, classes, className } = props;
  return (
    <Grid
      container
      className={classNames(className, {
        [classes.container]: true
      })}
      data-qa-card={title}
    >
      <Grid item xs={12} className={!title || !headerAction ? 'p0' : ''}>
        <Grid container alignItems="flex-start">
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
      <Grid item xs={12}>
        {props.children}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(DashboardCard);
