import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  title: string;
  action?: () => JSX.Element | JSX.Element[] | null;
}

type CombinedProps = Props;

const TableHeader: React.FC<CombinedProps> = ({ title, action }) => {
  const classes = useStyles();

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

export default TableHeader;
