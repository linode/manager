import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

export interface BreadCrumbProps {
  title: string | JSX.Element;
  parentLink?: string;
  parentText?: string;
  headerOnly?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  rootWithoutParent: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(),
    whiteSpace: 'nowrap',
  },
  rootHeaderOnly: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      flexBasis: '100%',
    },
  },
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = (props) => {
  const classes = useStyles();

  const { title, headerOnly } = props;

  return (
    <div
      className={
        headerOnly ? classes.rootHeaderOnly : classes.rootWithoutParent
      }
    >
      <Grid item>
        <Typography variant="h2">{title}</Typography>
      </Grid>
    </div>
  );
};

export default React.memo(HeaderBreadCrumb);
