import * as React from 'react';
import * as classnames from 'classnames';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import { BreadCrumbProps } from './HeaderBreadCrumb';
import Hidden from '../core/Hidden';
import Breadcrumb from '../Breadcrumb';
import DocumentationButton from '../CMR_DocumentationButton';

export interface HeaderProps extends BreadCrumbProps {
  actions?: JSX.Element;
  body?: JSX.Element;
  docsLink?: string;
  title: string | JSX.Element;
  bodyClassName?: string;
  isLanding?: boolean;
  isSecondary?: boolean;
  isDetailLanding?: boolean;
  headerOnly?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  breadcrumbOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cmrBGColors.bgSecondaryActions,
    padding: '4px 15px',
    [theme.breakpoints.down('sm')]: {
      borderBottom: `1px solid ${theme.cmrBorderColors.borderTable}`
    }
  },
  breadCrumbDetail: {
    padding: 0
  },
  breadCrumbSecondary: {
    justifyContent: 'space-between'
  },
  breadCrumbDetailLanding: {
    padding: '0 15px',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.cmrBorderColors.borderTable}`
  },
  contentOuter: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    padding: '10px 0',
    // Needed for the 'clear filters' button on smaller screens, removed for medium+
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      padding: 10
    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'center',
      padding: 0,
      flexWrap: 'nowrap'
    },
    '& .MuiChip-root': {
      ...theme.applyStatusPillStyles,
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px'
    }
  },
  bodyDetailVariant: {
    padding: '4px 15px',
    justifyContent: 'space-between',
    flexWrap: 'nowrap'
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const classes = useStyles();

  const {
    actions,
    body,
    docsLink,
    parentLink,
    isLanding,
    bodyClassName,
    isSecondary,
    isDetailLanding
  } = props;

  return (
    <>
      <Grid item className={classes.root}>
        {isLanding && <Breadcrumb pathname={location.pathname} data-qa-title />}
        {docsLink && <DocumentationButton href={docsLink} />}
      </Grid>
      <Grid
        item
        xs={12}
        className={classnames({
          [classes.breadcrumbOuter]: true,
          [classes.breadCrumbDetail]: Boolean(parentLink),
          [classes.breadCrumbSecondary]: Boolean(isSecondary),
          [classes.breadCrumbDetailLanding]: Boolean(isDetailLanding)
        })}
      >
        <Hidden smDown>
          {body ? (
            <Grid
              className={classnames({
                [classes.contentOuter]: true,
                [bodyClassName ?? '']: Boolean(bodyClassName)
              })}
              item
            >
              {body}
            </Grid>
          ) : null}
        </Hidden>
        {actions}
      </Grid>
      <Hidden mdUp>
        {body ? (
          <Grid
            item
            xs={12}
            className={classnames({
              [classes.contentOuter]: true,
              [classes.bodyDetailVariant]:
                Boolean(parentLink) || Boolean(isDetailLanding)
            })}
          >
            {body}
          </Grid>
        ) : null}
      </Hidden>
    </>
  );
};

export default EntityHeader;
