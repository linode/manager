import {
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import * as React from 'react';

const ERROR_STATE_TITLE = 'An unexpected error occurred.';

interface ErrorStateProps {
  errorText?: string;
  heightPx?: string;
  isTransparent?: boolean;
}

export const ErrorState = (props: ErrorStateProps) => {
  const { errorText, heightPx, isTransparent = true } = props;

  return (
    <ZeroErrorState
      style={{
        background: isTransparent
          ? 'transparent'
          : 'var(--token-component-container-background)',
        height: heightPx || 'auto',
      }}
    >
      <ZeroErrorIcon icon="error-cloud" />
      <ZeroErrorTitle>{errorText ?? ERROR_STATE_TITLE}</ZeroErrorTitle>
    </ZeroErrorState>
  );
};
