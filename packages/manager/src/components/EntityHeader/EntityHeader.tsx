import * as React from 'react';
import * as classnames from 'classnames';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';
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
    padding: '4px 16px',
    paddingRight: theme.spacing(),
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
    borderTop: `1px solid ${theme.cmrBorderColors.borderTable}`,
    margin: 0,
    padding: '0 15px',
    justifyContent: 'space-between'
  },
  contentOuter: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    padding: theme.spacing(),
    // Needed for the 'clear filters' button on smaller screens, removed for medium+
    flexWrap: 'wrap',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'center',
      padding: 0,
      flexWrap: 'nowrap'
    },
    '& .MuiChip-root': {
      ...theme.applyStatusPillStyles,
      height: 30,
      marginTop: 1,
      fontSize: '.875rem',
      letterSpacing: '.5px'
    }
  },
  bodyDetailVariant: {
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    backgroundColor: theme.cmrBGColors.bgPaper,
    padding: 0
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const classes = useStyles();

  const {
    actions,
    body,
    docsLink,
    iconType,
    parentLink,
    parentText,
    title,
    isLanding,
    bodyClassName,
    isSecondary,
    isDetailLanding,
    headerOnly,
    displayIcon
  } = props;

  return (
    <>
      <Grid item className={classes.root}>
        {isLanding && <Breadcrumb pathname={location.pathname} data-qa-title />}
        {docsLink && <DocumentationButton href={docsLink} />}
      </Grid>
      <Grid item className={classes.root}>
        {isDetailLanding && (
          <HeaderBreadCrumb
            iconType={iconType}
            displayIcon={displayIcon}
            title={title}
            parentLink={parentLink}
            parentText={parentText}
            headerOnly={headerOnly}
          />
        )}
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
          {body ? (
            <Grid
              className={classnames({
                // [classes.contentOuter]: true,
                [bodyClassName ?? '']: Boolean(bodyClassName)
              })}
              item
            >
              {body}
            </Grid>
          ) : null}
          {/* </Hidden> */}

          {/* I think only Landing variant uses this? */}
          {actions}
        </Grid>
      </Grid>
    </>
  );
};

export default EntityHeader;
