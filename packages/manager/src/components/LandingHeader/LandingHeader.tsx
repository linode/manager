import Grid from '@mui/material/Unstable_Grid2';
import { Theme, styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import BetaFeedbackIcon from 'src/assets/icons/icon-feedback.svg';
import {
  Breadcrumb,
  BreadcrumbProps,
} from 'src/components/Breadcrumb/Breadcrumb';
import { Button } from 'src/components/Button/Button';
import { DocsLink } from 'src/components/DocsLink/DocsLink';

export interface LandingHeaderProps {
  analyticsLabel?: string;
  betaFeedbackLink?: string;
  breadcrumbDataAttrs?: { [key: string]: boolean };
  breadcrumbProps?: BreadcrumbProps;
  buttonDataAttrs?: { [key: string]: boolean | string };
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
  shouldHideDocsAndCreateButtons?: boolean;
  title?: JSX.Element | string;
}

/**
 * @note Passing a title prop will override the final `breadcrumbProps` label.
 * If you don't want this behavior, omit a title prop.
 */
export const LandingHeader = ({
  analyticsLabel,
  betaFeedbackLink,
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
  shouldHideDocsAndCreateButtons,
  title,
}: LandingHeaderProps) => {
  const theme = useTheme();
  const renderActions = Boolean(onButtonClick || extraActions);
  const labelTitle = title?.toString();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  return (
    <Grid
      alignItems="center"
      container
      data-qa-entity-header
      justifyContent="space-between"
      sx={{ width: '100%' }}
    >
      <Grid>
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
      {!shouldHideDocsAndCreateButtons && (
        <Grid>
          <Grid
            sx={{
              flex: '1 1 auto',
              marginLeft: xsDown ? theme.spacing(1) : undefined,
            }}
            alignItems="center"
            display="flex"
            flexWrap={xsDown ? 'wrap' : 'nowrap'}
            gap={3}
            justifyContent="flex-end"
          >
            {betaFeedbackLink && (
              <span
                style={{
                  marginLeft: xsDown ? `${theme.spacing(2)}` : undefined,
                  marginRight: `${theme.spacing(2)}`,
                }}
              >
                <DocsLink
                  href={betaFeedbackLink}
                  icon={<BetaFeedbackIcon />}
                  label="BETA Feedback"
                />
              </span>
            )}
            {docsLink ? (
              <DocsLink
                analyticsLabel={docsAnalyticsLabel}
                href={docsLink}
                label={docsLabel}
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
      )}
    </Grid>
  );
};

const Actions = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
}));
