import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb';
import DocsLink from '../DocsLink';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions?: JSX.Element;
  analyticsLabel?: string;
  body?: JSX.Element;
  docsLink?: string;
  docsLabel?: string;
  title: string | JSX.Element;
  bodyClassName?: string;
  isLanding?: boolean;
  isSecondary?: boolean;
  isDetailLanding?: boolean;
  headerOnly?: boolean;
  removeCrumbX?: number;
  breadcrumbProps?: BreadcrumbProps;
  onDocsClick?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 0,
    width: '100%',
    background: 'red',
  },
  landing: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
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
    backgroundColor: 'yellow',
    // backgroundColor: theme.bg.bgPaper,
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
  breadcrumbOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    padding: '4px 16px',
    paddingRight: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      borderBottom: `1px solid ${theme.borderColors.borderTable}`,
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
    [theme.breakpoints.down('sm')]: {
      marginBottom: 0,
    },
  },
  pink: {
    background: 'pink',
  },
  detailed: {
    background: 'green',
  },
}));

// @todo: Refactor this entire component now that we have less variants.
export const EntityHeader: React.FC<HeaderProps> = (props) => {
  const classes = useStyles();

  const {
    actions,
    analyticsLabel,
    body,
    docsLink,
    docsLabel,
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
    onDocsClick,
  } = props;

  const labelTitle = title.toString();
  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  return (
    <>
      {isLanding && (
        <Grid
          data-qa-entity-header
          container
          className={`${classes.root} ${classes.landing}`}
        >
          <Grid container item xs={12} sm={4}>
            <Breadcrumb
              className={`${classes.pink}`}
              labelTitle={labelTitle}
              pathname={location.pathname} // TODO: This doesn't exist and is causing issues...
              removeCrumbX={removeCrumbX}
              {...breadcrumbProps}
              data-qa-title
            />
          </Grid>
          <Grid
            className={classes.actionsWrapper}
            item
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            xs={12}
            sm={8}
          >
            {props.children}
            {docsLink ? (
              <DocsLink
                href={docsLink}
                label={docsLabel}
                analyticsLabel={docsAnalyticsLabel}
                onClick={onDocsClick}
              />
            ) : null}
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
          className={classNames(classes.detailed, {
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
              className={classNames({
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
