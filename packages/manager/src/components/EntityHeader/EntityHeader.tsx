import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { BreadcrumbProps } from '../Breadcrumb';
import Typography, { TypographyProps } from 'src/components/core/Typography';

export interface HeaderProps {
  actions?: JSX.Element;
  analyticsLabel?: string;
  body?: JSX.Element;
  docsLink?: string;
  docsLabel?: string;
  title: string | JSX.Element;
  bodyClassName?: string;
  isLanding?: boolean;
  isSummaryView?: boolean;
  variant?: TypographyProps['variant'];
  headerOnly?: boolean;
  removeCrumbX?: number;
  breadcrumbProps?: BreadcrumbProps;
  onDocsClick?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  rootWithoutParent: {
    background: 'magenta',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(),
    whiteSpace: 'nowrap',
  },
  rootHeaderOnly: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      flexBasis: '100%',
    },
  },
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
    background: 'lightgreen',
  },
}));

// @todo: Refactor this entire component now that we have less variants.
export const EntityHeader: React.FC<HeaderProps> = (props) => {
  const classes = useStyles();

  const {
    // actions,
    // analyticsLabel,
    // docsLink,
    // docsLabel,
    children,
    title,
    // isLanding,
    bodyClassName,
    isSummaryView,
    variant = 'h2',
    headerOnly,
    // removeCrumbX,
    // breadcrumbProps,
    // onDocsClick,
  } = props;

  // const labelTitle = title.toString();
  // const docsAnalyticsLabel = analyticsLabel
  //   ? analyticsLabel
  //   : `${title} Landing`;

  return (
    <>
      {/* {isLanding && (

      )} */}

      <Grid item className={`${classes.root} ${classes.details}`}>
        {/* Currently only used for the Linode Landing card/summary view */}
        {isSummaryView && (
          <div
            className={
              headerOnly ? classes.rootHeaderOnly : classes.rootWithoutParent
            }
          >
            <Grid item>
              <Typography variant={variant}>{title}</Typography>
            </Grid>
          </div>
        )}
        <Grid
          item
          xs={12}
          className={classNames(classes.detailed, {
            [classes.breadcrumbOuter]: isSummaryView,
            [classes.breadCrumbDetailLanding]: Boolean(isSummaryView),
          })}
        >
          {children && (
            <Grid
              className={classNames({
                [classes.contentOuter]: true,
                [bodyClassName ?? '']: Boolean(bodyClassName),
              })}
              item
            >
              {children}
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EntityHeader;
