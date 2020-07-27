import * as React from 'react';
import * as classnames from 'classnames';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions?: JSX.Element;
  body?: JSX.Element;
  title: string | JSX.Element;
  bodyClassName?: string;
  isLanding?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bg.white,
    height: 50,
    width: '100%',
    padding: '8px 8px 8px 15px'
  },
  rootMobile: {
    backgroundColor: theme.bg.white
  },
  breadcrumbOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid #f4f5f6',
    padding: '8px 15px'
  },
  breadCrumbDetail: {
    padding: 0
  },

  rootHasBreadcrumb: {
    padding: 8
  },
  contentOuter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& .MuiChip-root': {
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px'
    }
  },
  bodyWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '10px 0'
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
    // <div
    //   className={classnames({
    //     [classes.root]: true,
    //     [classes.rootHasBreadcrumb]: Boolean(parentLink)
    //   })}
    // >
    //   <Grid item xs={Boolean(actions) ? 7 : 12}>
    //     <Grid container direction="row" alignItems="center">
    //       <HeaderBreadCrumb
    //         iconType={iconType}
    //         title={title}
    //         parentLink={parentLink}
    //         parentText={parentText}
    //       />
    //       {body && (
    //         <Grid
    //           className={classnames({
    //             [classes.contentOuter]: true,
    //             [bodyClassName ?? '']: Boolean(bodyClassName)
    //           })}
    //           item
    //         >
    //           {body}
    //         </Grid>
    //       )}
    //     </Grid>
    //   </Grid>
    //   {Boolean(actions) && (
    //     <Grid container item xs={5} justify="flex-end" alignItems="center">
    //       {actions}
    //     </Grid>
    //   )}
    // </div>
    <Grid item className={classes.rootMobile}>
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

        {/* I think only Landing variant uses this? */}
        {actions && actions}
      </Grid>
      <Grid item xs={12} className={classes.bodyWrapper}>
        {body && body}
      </Grid>
    </Grid>
  );
};

export default EntityHeader;
