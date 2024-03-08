import * as React from 'react';
import { BreadcrumbProps } from 'src/components/Breadcrumb/Breadcrumb';

export interface LandingHeaderProps {
  analyticsLabel?: string;
  betaFeedbackLink?: string;
  breadcrumbDataAttrs?: { [key: string]: boolean };
  breadcrumbProps?: BreadcrumbProps;
  buttonDataAttrs?: { [key: string]: boolean | string };
  createButtonText?: string;
  disableEditButton?: boolean;
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
