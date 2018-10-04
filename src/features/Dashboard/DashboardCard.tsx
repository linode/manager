import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'container'
  | 'headerAction';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  container: {
    marginTop: theme.spacing.unit * 3,
  },
  headerAction: {
    position: 'relative',
    top: theme.spacing.unit / 2,
  },
});

interface Props {
  title?: string;
  headerAction?: () => JSX.Element | JSX.Element[] | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DashboardCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { title, headerAction, classes } = props;
  return (
    <Grid container className={classes.container} data-qa-card={title}>
      <Grid item xs={12}>
        <Grid container justify="space-between" alignItems="flex-start">
          {title && 
            <Grid item className={'py0'}>
              <Typography variant="title">
                {title}
              </Typography>
            </Grid>
          }
          {headerAction &&
            <Grid item className={'py0'}>
              <Typography variant="caption" className={classes.headerAction}>
                {headerAction()}
              </Typography>
            </Grid>
          }
        </Grid>
      </Grid>
      <Grid item xs={12}>{props.children}</Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DashboardCard);
