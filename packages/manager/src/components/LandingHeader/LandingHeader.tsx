import { Button } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import type { JSX } from 'react';

import BetaFeedbackIcon from 'src/assets/icons/icon-feedback.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocsLink } from 'src/components/DocsLink/DocsLink';

import type { Theme } from '@mui/material/styles';
import type { BreadcrumbProps } from 'src/components/Breadcrumb/Breadcrumb';

export interface LandingHeaderProps {
  analyticsLabel?: string;
  betaFeedbackLink?: string;
  breadcrumbDataAttrs?: { [key: string]: boolean };
  breadcrumbProps?: Partial<BreadcrumbProps>;
  buttonDataAttrs?: { [key: string]: boolean | string };
  createButtonText?: string;
  disabledBreadcrumbEditButton?: boolean;
  disabledCreateButton?: boolean;
  docsLabel?: string;
  docsLink?: string;
  entity?: string;
  extraActions?: JSX.Element;
  loading?: boolean;
  onButtonClick?: () => void;
  onButtonKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onDocsClick?: () => void;
  removeCrumbX?: number | number[];
  shouldHideDocsAndCreateButtons?: boolean;
  spacingBottom?: 0 | 4 | 16 | 24;
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
  disabledBreadcrumbEditButton,
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
  spacingBottom = 24,
  title,
}: LandingHeaderProps) => {
  const theme = useTheme();
  const renderActions = Boolean(onButtonClick || extraActions);
  const labelTitle = title?.toString();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const customXsDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(636)
  );
  const customSmMdBetweenBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between(636, 'md')
  );

  const docsAnalyticsLabel = analyticsLabel
    ? analyticsLabel
    : `${title} Landing`;

  return (
    <StyledLandingHeaderGrid
      container
      data-qa-entity-header
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacingBottom !== undefined ? `${spacingBottom}px` : 0,
        width: '100%',
      }}
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
          disabledBreadcrumbEditButton={disabledBreadcrumbEditButton}
        />
      </Grid>
      {!shouldHideDocsAndCreateButtons && (
        <Grid>
          <Grid
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: xsDown ? 'wrap' : 'nowrap',
              gap: 3,
              justifyContent: 'flex-end',
              flex: '1 1 auto',

              marginLeft: customSmMdBetweenBreakpoint
                ? theme.spacingFunction(16)
                : customXsDownBreakpoint
                  ? theme.spacingFunction(8)
                  : undefined,
            }}
          >
            {betaFeedbackLink && (
              <span
                style={{
                  marginLeft: xsDown ? theme.spacingFunction(16) : undefined,
                  marginRight: theme.spacingFunction(16),
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
              <StyledActions>
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
              </StyledActions>
            )}
          </Grid>
        </Grid>
      )}
    </StyledLandingHeaderGrid>
  );
};

const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacingFunction(24),
  justifyContent: 'flex-end',
}));

const StyledLandingHeaderGrid = styled(Grid)(({ theme }) => ({
  '&:not(:first-of-type)': {
    marginTop: theme.spacingFunction(24),
  },
}));
