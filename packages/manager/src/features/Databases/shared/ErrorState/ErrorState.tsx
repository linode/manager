import {
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import * as React from 'react';

import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../../constants';

interface ErrorStateProps {
  errorText?: string;
  type?: 'error' | 'notFound';
}

export const ErrorState = (props: ErrorStateProps) => {
  const { errorText, type = 'error' } = props;

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon={type === 'error' ? 'error-cloud' : 'error-doc'} />
      {errorText && errorText !== 'An unexpected error occurred.' ? (
        <ZeroErrorTitle>{errorText}</ZeroErrorTitle>
      ) : (
        <>
          <ZeroErrorTitle>{ERROR_STATE_TITLE}</ZeroErrorTitle>
          <ZeroErrorDescription>{ERROR_STATE_TEXT}</ZeroErrorDescription>
        </>
      )}
    </ZeroErrorState>
  );
};
