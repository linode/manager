import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import { HeaderProps } from 'src/components/EntityHeader/EntityHeader';
import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb';
import DocsLink from '../DocsLink';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginLeft: theme.spacing(),
    padding: 0,
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 0,
    width: '100%',
    background: 'red',
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
  landing: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      padding: 0,
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
}));

export interface Props extends Omit<HeaderProps, 'actions'> {
  extraActions?: JSX.Element;
  body?: JSX.Element;
  onDocsClick?: () => void;
  docsLink?: string;
  docsLabel?: string;
  onAddNew?: () => void;
  title: string | JSX.Element;
  removeCrumbX?: number;
  entity?: string;
  analyticsLabel?: string;
  createButtonWidth?: number;
  createButtonText?: string;
  loading?: boolean;
  breadcrumbProps?: BreadcrumbProps;
  disabledCreateButton?: boolean;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = (props) => {
  const classes = useStyles();

  const {
    docsLink,
    onAddNew,
    entity,
    title,
    analyticsLabel,
    extraActions,
    createButtonWidth,
    createButtonText,
    loading,
    docsLabel,
    onDocsClick,
    removeCrumbX,
    breadcrumbProps,
    disabledCreateButton,
  } = props;

  const defaultCreateButtonWidth = 152;

  const actions = React.useMemo(
    () => (
      <>
        {extraActions}

        {onAddNew && (
          <Button
            buttonType="primary"
            className={classes.button}
            loading={loading}
            onClick={onAddNew}
            style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
            disabled={disabledCreateButton}
          >
            {createButtonText ?? `Create ${entity}`}
          </Button>
        )}
      </>
    ),
    [
      extraActions,
      onAddNew,
      classes.button,
      loading,
      createButtonWidth,
      createButtonText,
      entity,
      disabledCreateButton,
    ]
  );

  const labelTitle = title.toString();
  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  return (
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
        <div className={classes.actions}>
          {extraActions || onAddNew ? actions : undefined}
        </div>
      </Grid>
    </Grid>
  );
};

export default LandingHeader;
