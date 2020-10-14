import * as React from 'react';
import { Link } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface BreadCrumbProps {
  title: string | JSX.Element;
  iconType?: Variant;
  parentLink?: string;
  parentText?: string;
  displayIcon?: boolean;
  headerOnly?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%'
    }
  },
  rootWithoutParent: {
    display: 'flex',
    alignItems: 'center'
  },
  rootHeaderOnly: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      flexBasis: '100%'
    }
  },
  iconContainer: {
    padding: `5px !important`,
    marginLeft: 16
  },
  headerWithLink: {
    display: 'flex',
    flexWrap: 'nowrap',
    height: 50,
    position: 'relative',
    alignItems: 'center',
    backgroundColor: theme.cmrBGColors.bgBreadcrumbParent,
    marginRight: theme.spacing(2),

    '&:before': {
      content: '""',
      position: 'absolute',
      left: '100%',
      top: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right top, ${theme.cmrBGColors.bgBreadcrumbParent} 0%, ${theme.cmrBGColors.bgBreadcrumbParent} 50%, transparent 46.1%)`,
      zIndex: 1
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '100%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.cmrBGColors.bgBreadcrumbParent} 0%, ${theme.cmrBGColors.bgBreadcrumbParent} 50%, transparent 46.1%)`,
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
      backgroundColor: theme.cmrBGColors.bgBreadcrumbParent,
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
      background: `linear-gradient(to right top, ${theme.cmrBorderColors.borderTable} 0%, ${theme.cmrBorderColors.borderTable} 50%, transparent 46.1%)`,
      zIndex: 0
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '101%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.cmrBorderColors.borderTable} 0%, ${theme.cmrBorderColors.borderTable} 50%, transparent 46.1%)`,
      zIndex: 0
    }
  },
  parentLinkText: {
    color: theme.cmrTextColors.textBreadcrumbParent
  },
  parentTitleText: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(2) - 2,
    color: theme.cmrTextColors.headlineStatic
  },
  titleText: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(2) - 2,
    paddingLeft: theme.spacing(2) - 2,
    lineHeight: 1.2,
    color: theme.cmrTextColors.headlineStatic
  }
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = props => {
  const {
    iconType,
    parentLink,
    parentText,
    title,
    displayIcon,
    headerOnly
  } = props;
  const classes = useStyles();

  const _displayIcon = displayIcon ?? true;

  if (parentLink) {
    return (
      <div className={classes.root}>
        <Grid item className={classes.headerWithLink}>
          <Grid wrap="nowrap" container alignItems="center" justify="center">
            {iconType && _displayIcon && (
              <Grid item className={classes.iconContainer}>
                <EntityIcon variant={iconType} />
              </Grid>
            )}
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
      </div>
    );
  }

  return (
    <div
      className={
        headerOnly ? classes.rootHeaderOnly : classes.rootWithoutParent
      }
    >
      {iconType && _displayIcon && (
        <Grid item>
          <EntityIcon variant={iconType} />
        </Grid>
      )}
      <Grid item>
        <Typography
          variant="h2"
          className={iconType && _displayIcon ? classes.titleText : 'p0'}
        >
          {title}
        </Typography>
      </Grid>
    </div>
  );
};

export default React.memo(HeaderBreadCrumb);
