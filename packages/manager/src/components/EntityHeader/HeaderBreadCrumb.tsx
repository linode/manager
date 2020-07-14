import * as React from 'react';
import { Link } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface BreadCrumbProps {
  title: string | JSX.Element;
  iconType: Variant;
  parentLink?: string;
  parentText?: string;
  displayIcon?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  iconContainer: {
    padding: `5px !important`
  },
  headerWithLink: {
    flexWrap: 'nowrap',
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
  gap: {
    '&:before': {
      content: '""',
      position: 'absolute',
      left: '100%',
      top: 0,
      width: 1,
      height: '100%',
      backgroundColor: theme.bg.lightBlue,
      zIndex: 2
    }
  },
  border: {
    '&:before': {
      content: '""',
      position: 'absolute',
      left: '101%',
      top: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right top, #f4f5f6 0%, #f4f5f6 50%, transparent 46.1%)`,
      zIndex: 0
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '101%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, #f4f5f6 0%, #f4f5f6 50%, transparent 46.1%)`,
      zIndex: 0
    }
  },
  parentLinkText: {
    color: theme.color.blue
  },
  parentTitleText: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(2) - 2
  },
  titleText: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(2) - 2,
    lineHeight: 1.2,
    [theme.breakpoints.down('sm')]: {
      lineHeight: '24px',
      paddingTop: 5
    }
  }
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = props => {
  const { iconType, parentLink, parentText, title, displayIcon } = props;
  const classes = useStyles();

  if (parentLink) {
    return (
      <>
        <Grid item className={classes.headerWithLink}>
          <Grid wrap="nowrap" container alignItems="center" justify="center">
            <Grid item className={classes.iconContainer}>
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
          <div className={classes.gap} />
          <div className={classes.border} />
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
      {typeof displayIcon === 'undefined' ||
        (Boolean(displayIcon) && (
          <Grid item>
            <EntityIcon variant={iconType} />
          </Grid>
        ))}
      <Grid item>
        <Typography variant="h2" className={classes.titleText}>
          {title}
        </Typography>
      </Grid>
    </>
  );
};

export default React.memo(HeaderBreadCrumb);
