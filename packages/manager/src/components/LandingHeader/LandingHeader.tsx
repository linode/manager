import * as React from 'react';
import Button from 'src/components/Button';
import { HeaderProps } from 'src/components/EntityHeader/EntityHeader';
import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb';
import DocsLink from '../DocsLink';
import Grid from '@mui/material/Grid';
import { useTheme, styled } from '@mui/material/styles';

export interface Props extends Omit<HeaderProps, 'actions'> {
  analyticsLabel?: string;
  breadcrumbDataAttrs?: { [key: string]: boolean };
  breadcrumbProps?: BreadcrumbProps;
  buttonDataAttrs?: { [key: string]: boolean };
  createButtonText?: string;
  disabledCreateButton?: boolean;
  docsLabel?: string;
  docsLink?: string;
  entity?: string;
  extraActions?: JSX.Element;
  loading?: boolean;
  onButtonClick?: () => void;
  onButtonKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onDocsClick?: () => void;
  removeCrumbX?: number;
  title?: string | JSX.Element;
}

const Actions = styled('div')(({ theme }) => ({
  marginLeft: `${theme.spacing(2)}`,
}));

/**
 * @note Passing a title prop will override the final `breadcrumbProps` label.
 * If you don't want this behavior, omit a title prop.
 */
export const LandingHeader = ({
  analyticsLabel,
  breadcrumbDataAttrs,
  breadcrumbProps,
  buttonDataAttrs,
  createButtonText,
  disabledCreateButton,
  docsLabel,
  docsLink,
  entity,
  extraActions,
  loading,
  onButtonClick,
  onButtonKeyPress,
  onDocsClick,
  removeCrumbX,
  title,
}: Props) => {
  const theme = useTheme();
  const renderActions = Boolean(onButtonClick || extraActions);
  const labelTitle = title?.toString();

  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  const sxButton = {
    marginLeft: theme.spacing(1),
  };

  return (
    <Grid
      container
      data-qa-entity-header
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>
        <Breadcrumb
          data-qa-title
          labelTitle={labelTitle}
          // The pathname set by "breadcrumbProps" is just a fallback to satisfy the type.
          pathname={location.pathname}
          removeCrumbX={removeCrumbX}
          {...breadcrumbDataAttrs}
          {...breadcrumbProps}
        />
      </Grid>
      <Grid item>
        <Grid alignItems="center" container item justifyContent="flex-end">
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
              {onButtonClick ? (
                <Button
                  buttonType="primary"
                  disabled={disabledCreateButton}
                  loading={loading}
                  onClick={onButtonClick}
                  sx={sxButton}
                  onKeyPress={onButtonKeyPress}
                  {...buttonDataAttrs}
                >
                  {createButtonText ?? `Create ${entity}`}
                </Button>
              ) : null}
            </Actions>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default LandingHeader;
