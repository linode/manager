import * as React from 'react';
import { Link } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface BreadCrumbProps {
  title: string;
  iconType: Variant;
  parentLink?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerWithLink: {
    background: `
      linearGradient(135deg, transparent 15px, #58a 0) top left,
      linearGradient(-135deg, transparent 15px, #58a 0) top right
      `
  },
  parentLinkText: {
    color: theme.color.blue
  }
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = props => {
  const { iconType, parentLink, title } = props;
  const classes = useStyles();

  if (parentLink) {
    return (
      <>
        <Grid item>
          <Grid
            container
            className={classes.headerWithLink}
            alignItems="center"
            justify="center"
          >
            <Grid item>
              <EntityIcon variant={iconType} />
            </Grid>
            <Grid item>
              <Link to={parentLink}>
                <Typography variant="h2" className={classes.parentLinkText}>
                  {iconType}s
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="h2">{title}</Typography>
        </Grid>
      </>
    );
  }
  return (
    <>
      <Grid item>
        <EntityIcon variant={iconType} />
      </Grid>
      <Grid item>
        <Typography variant="h2">{title}s</Typography>
      </Grid>
    </>
  );
};

export default React.memo(HeaderBreadCrumb);
