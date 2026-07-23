import {
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import * as React from 'react';

const ERROR_STATE_TITLE = 'An unexpected error occurred.';

interface ErrorStateProps {
  errorText?: string;
}

export const ErrorState = (props: ErrorStateProps) => {
  const { errorText } = props;

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="error-cloud" />
      <ZeroErrorTitle>{errorText ?? ERROR_STATE_TITLE}</ZeroErrorTitle>
    </ZeroErrorState>
  );
};
