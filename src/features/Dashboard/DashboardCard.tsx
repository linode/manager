import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing.unit * 3,
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
    <Grid container>
      <Grid item xs={12}>
        <Grid container>
          {title && 
            <Grid item xs={6} className={'py0'}>
              <Typography variant="title" className={classes.title}>
                {title}
              </Typography>
            </Grid>
          }
          {headerAction && <Grid item xs={6} style={{ textAlign: 'right' }}>{headerAction()}</Grid>}
        </Grid>
      </Grid>
      <Grid item xs={12}>{props.children}</Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DashboardCard);
