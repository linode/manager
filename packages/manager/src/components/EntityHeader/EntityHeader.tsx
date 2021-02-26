import * as classnames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb';
import DocumentationButton from '../DocumentationButton';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

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
  removeCrumbX?: number;
  breadcrumbProps?: BreadcrumbProps;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 0,
    width: '100%',
  },
  landing: {
    marginBottom: 0,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      padding: 0,
    },
  },
  docs: {
    marginRight: theme.spacing(),
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
  details: {
    backgroundColor: theme.cmrBGColors.bgPaper,
    margin: 0,
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
    },
  },
  breadcrumbOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cmrBGColors.bgPaper,
    padding: '4px 16px',
    paddingRight: theme.spacing(),
    [theme.breakpoints.down('sm')]: {
      borderBottom: `1px solid ${theme.cmrBorderColors.borderTable}`,
    },
  },
  breadCrumbDetail: {
    padding: 0,
  },
  breadCrumbSecondary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    marginLeft: 15,
  },
  breadCrumbDetailLanding: {
    margin: 0,
    padding: 0,
    paddingLeft: theme.spacing(),
    justifyContent: 'space-between',
  },
  contentOuter: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    padding: 0,
    '& .MuiChip-root': {
      ...theme.applyStatusPillStyles,
      height: 30,
      fontSize: '.875rem',
      letterSpacing: '.5px',
    },
  },
  actionsWrapper: {
    [theme.breakpoints.only('sm')]: {
      marginRight: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: 0,
    },
  },
}));

// @todo: Refactor this entire component now that we have less variants.
export const EntityHeader: React.FC<HeaderProps> = props => {
  const classes = useStyles();

  const {
    actions,
    body,
    docsLink,
    parentLink,
    parentText,
    title,
    isLanding,
    bodyClassName,
    isSecondary,
    isDetailLanding,
    headerOnly,
    removeCrumbX,
    breadcrumbProps,
  } = props;

  const labelTitle = title.toString();

  return (
    <>
      {isLanding && (
        <Grid container item className={`${classes.root} ${classes.landing}`}>
          <Grid container item xs={12} sm={4}>
            <Breadcrumb
              labelTitle={labelTitle}
              pathname={location.pathname}
              removeCrumbX={removeCrumbX}
              {...breadcrumbProps}
              data-qa-title
            />
          </Grid>
          <Grid
            className={classes.actionsWrapper}
            container
            item
            alignItems="center"
            justify="flex-end"
            xs={12}
            sm={8}
          >
            {props.children}
            {docsLink && <DocumentationButton href={docsLink} />}
            <div className={classes.actions}>{actions}</div>
          </Grid>
        </Grid>
      )}

      {/* Currently only used for the Linode Landing card/summary view */}
      <Grid item className={`${classes.root} ${classes.details}`}>
        {isDetailLanding && (
          <HeaderBreadCrumb
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
            [classes.breadcrumbOuter]: isDetailLanding,
            [classes.breadCrumbDetail]: Boolean(parentLink),
            [classes.breadCrumbSecondary]: Boolean(isSecondary),
            [classes.breadCrumbDetailLanding]: Boolean(isDetailLanding),
          })}
        >
          {isSecondary ? (
            <Typography variant="h3" className={classes.label}>
              {labelTitle}
            </Typography>
          ) : null}
          {body && (
            <Grid
              className={classnames({
                [classes.contentOuter]: true,
                [bodyClassName ?? '']: Boolean(bodyClassName),
              })}
              item
            >
              {body}
            </Grid>
          )}
          {isSecondary ? actions : null}
        </Grid>
      </Grid>
    </>
  );
};

export default EntityHeader;
