import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/core/Grid';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  bannerOuter: {
    backgroundColor: theme.bg.primaryNavPaper,
    padding: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 1110
  },
  header: {
    color: '#fff',
    textAlign: 'center'
  },
  link: {
    color: '#fff',
    textDecoration: 'underline'
  }
}));

const BLMBanner: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid className={classes.bannerOuter} item xs={12}>
      <Typography variant="h2" className={classes.header}>
        Black Lives Matter.&nbsp;
        <Link
          to="https://support.eji.org/give/153413/#!/donation/checkout"
          className={classes.link}
        >
          Support the Equal Justice Initiative.
        </Link>
      </Typography>
    </Grid>
  );
};

export default BLMBanner;
