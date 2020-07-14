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
    padding: '8px 8px 8px 15px',
    [theme.breakpoints.down(695)]: {
      alignItems: 'flex-start',
      height: 100
    },
    [theme.breakpoints.down('sm')]: {
      '&:before': {
        display: 'block',
        content: "''",
        backgroundColor: theme.palette.divider,
        height: 1,
        width: 'calc(100% + 8px)',
        position: 'absolute',
        top: 58,
        left: -15,
        zIndex: 1
      }
    }
  },
  containerLeft: {
    [theme.breakpoints.down('md')]: {
      flexBasis: '85%',
      maxWidth: '85%'
    },
    [theme.breakpoints.down(695)]: {
      flexBasis: '50%',
      maxWidth: '50%'
    },
    [theme.breakpoints.down('xs')]: {
      flexBasis: '20%',
      maxWidth: '20%'
    }
  },
  containerRight: {
    [theme.breakpoints.down('xs')]: {
      flexBasis: '80%',
      maxWidth: '80%'
    }
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
    <div
      className={classnames({
        [classes.root]: true,
        [classes.rootHasBreadcrumb]: Boolean(parentLink)
      })}
    >
      <Grid item xs={Boolean(actions) ? 7 : 12}>
        <Grid container direction="row" alignItems="center">
          <HeaderBreadCrumb
            iconType={iconType}
            title={title}
            parentLink={parentLink}
            parentText={parentText}
          />
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
        </Grid>
      </Grid>
      {Boolean(actions) && (
        <Grid container item xs={5} justify="flex-end" alignItems="center">
          {actions}
        </Grid>
      )}
    </div>
  );
};

export default EntityHeader;
