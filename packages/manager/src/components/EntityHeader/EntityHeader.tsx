import * as React from 'react';
import * as classnames from 'classnames';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';
import Hidden from '../core/Hidden';

export interface HeaderProps extends BreadCrumbProps {
  actions?: JSX.Element;
  body?: JSX.Element;
  title: string | JSX.Element;
  bodyClassName?: string;
  isLanding?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
  },
  breadcrumbOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '4px 15px',
    [theme.breakpoints.down('sm')]: {
      borderBottom: '1px solid #f4f5f6'
    }
  },
  breadCrumbDetail: {
    padding: 0
  },
  contentOuter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.only('xs')]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '10px 0'
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
      padding: '10px'
    },
    '& .MuiChip-root': {
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px'
    }
  },
  bodyDetailVariant: {
    padding: '4px 15px'
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const {
    actions,
    body,
    iconType,
    parentLink,
    parentText,
    title,
    bodyClassName
  } = props;
  const classes = useStyles();

  return (
    <Grid item className={classes.root}>
      <Grid
        item
        xs={12}
        className={classnames({
          [classes.breadcrumbOuter]: true,
          [classes.breadCrumbDetail]: Boolean(parentLink)
        })}
      >
        <HeaderBreadCrumb
          iconType={iconType}
          title={title}
          parentLink={parentLink}
          parentText={parentText}
        />
        <Hidden smDown>
          {body && (
            <Grid
              className={classnames({
                [classes.contentOuter]: true,
                [bodyClassName ?? '']: Boolean(bodyClassName)
              })}
              item
            >
              {body}
            </Grid>
          )}
        </Hidden>

        {/* I think only Landing variant uses this? */}
        {actions}
      </Grid>
      <Hidden mdUp>
        <Grid
          item
          xs={12}
          className={classnames({
            [classes.contentOuter]: true,
            [classes.bodyDetailVariant]: Boolean(parentLink)
          })}
        >
          {body}
        </Grid>
      </Hidden>
    </Grid>
  );
};

export default EntityHeader;
