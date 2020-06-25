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
      background: `linear-gradient(to right top, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 50%, transparent 46.1%)`,
      zIndex: 1
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '100%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 50%, transparent 46.1%)`,
      zIndex: 1
    }
  },
  border: {
    borderTop: '1px solid #f4f5f6',
    height: '50%',
    width: theme.spacing(4),
    position: 'absolute',
    top: 6.5,
    right: -theme.spacing() - 4,
    transform: 'rotate(61.5deg)',
    zIndex: 1,

    '&:before': {
      content: '""',
      borderTop: '1px solid #f4f5f6',
      height: '50%',
      width: theme.spacing(4),
      bottom: theme.spacing(0.5),
      right: -19.5,
      position: 'absolute',
      transform: 'rotate(56.75deg)'
    }
  },
  parentLinkText: {
    color: theme.color.blue
  },
  parentTitleText: {
    color: '#3683dc',
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(2) - 2
  },
  titleText: {
    paddingRight: theme.spacing(2) - 2
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
          <div className={classes.border}></div>
        </Grid>
        <Grid item>
          <Typography variant="h2" className={classes.parentTitleText}>
            {title}
          </Typography>
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
        <Typography variant="h2" className={classes.titleText}>
          {title}s
        </Typography>
      </Grid>
    </>
  );
};

export default React.memo(HeaderBreadCrumb);
