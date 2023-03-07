import * as React from 'react';
import Button from 'src/components/Button';
import { HeaderProps } from 'src/components/EntityHeader/EntityHeader';
import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb';
import DocsLink from '../DocsLink';
import Grid from '@mui/material/Grid';
import { useTheme, styled } from '@mui/material/styles';

export interface Props extends Omit<HeaderProps, 'actions'> {
  analyticsLabel?: string;
  body?: JSX.Element;
  breadcrumbProps?: BreadcrumbProps;
  createButtonText?: string;
  disabledCreateButton?: boolean;
  docsLabel?: string;
  docsLink?: string;
  entity?: string;
  extraActions?: JSX.Element;
  loading?: boolean;
  onAddNew?: () => void;
  onDocsClick?: () => void;
  removeCrumbX?: number;
  title: string | JSX.Element;
}

const Actions = styled('div')(({ theme }) => ({
  marginLeft: `${theme.spacing(2)}`,
}));

export const LandingHeader = ({
  analyticsLabel,
  breadcrumbProps,
  createButtonText,
  disabledCreateButton,
  docsLabel,
  docsLink,
  entity,
  extraActions,
  loading,
  onAddNew,
  onDocsClick,
  removeCrumbX,
  title,
}: Props) => {
  const theme = useTheme();
  const renderActions = Boolean(onAddNew || extraActions);
  const labelTitle = title.toString();

  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  const sxButton = {
    marginLeft: theme.spacing(1),
  };

  return (
    <Grid container data-qa-entity-header>
      <Grid container item xs={12} sm={4}>
        <Breadcrumb
          {...breadcrumbProps}
          data-qa-title
          labelTitle={labelTitle}
          pathname={location.pathname} // TODO: How is this passed in?
          removeCrumbX={removeCrumbX}
        />
      </Grid>
      <Grid
        alignItems="center"
        container
        item
        justifyContent="flex-end"
        sm={8}
        xs={12}
      >
        {docsLink ? (
          <DocsLink
            href={docsLink}
            label={docsLabel}
            analyticsLabel={docsAnalyticsLabel}
            onClick={onDocsClick}
          />
        ) : null}
        {renderActions && (
          <Actions>
            {extraActions}
            {onAddNew ? (
              <Button
                buttonType="primary"
                disabled={disabledCreateButton}
                loading={loading}
                onClick={onAddNew}
                sx={sxButton}
              >
                {createButtonText ?? `Create ${entity}`}
              </Button>
            ) : null}
          </Actions>
        )}
      </Grid>
    </Grid>
  );
};

export default LandingHeader;
