import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  title: string;
  action?: () => JSX.Element | JSX.Element[] | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableHeader: React.StatelessComponent<CombinedProps> = ({
  classes,
  title,
  action
}) => {
  return (
    <Grid container justify="space-between" alignItems="flex-end">
      <Grid item>
        <Typography
          variant="h2"
          className={classes.title}
          data-qa-table={title}
        >
          {title}
        </Typography>
      </Grid>
      {action && <Grid item>{action()}</Grid>}
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(TableHeader);
