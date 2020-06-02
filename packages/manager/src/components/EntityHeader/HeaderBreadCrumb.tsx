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
  parentText?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerWithLink: {
    position: 'relative',
    backgroundColor: theme.bg.lightBlue,
    marginRight: theme.spacing(2),
    '&:before': {
      content: '""',
      position: 'absolute',
      left: '100%',
      top: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right top, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 45%, transparent 46.1%)`,
      zIndex: 1
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '100%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 45%, transparent 46.1%)`,
      zIndex: 1
    }
  },
  parentLinkText: {
    color: theme.color.blue
  }
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = props => {
  const { iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

  if (parentLink) {
    return (
      <>
        <Grid item className={classes.headerWithLink}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <EntityIcon variant={iconType} />
            </Grid>
            <Grid item>
              <Link to={parentLink}>
                <Typography variant="h2" className={classes.parentLinkText}>
                  {parentText}
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
