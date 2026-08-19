import {
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import React from 'react';

import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../constants';
import { Paper } from '../Paper/Paper';

interface Props {
  /** Custom error message. When omitted, default title and description are shown. */
  errorText?: string;
  /** When true, wraps the error state in a Paper container. */
  withPaper?: boolean;
}

/**
 * Displays a generic cloud-error zero state with an icon, title, and description.
 * Used as a fallback UI when data fetching or permission checks fail.
 *
 * @param props.errorText - Custom error message. When omitted, default title and description are shown.
 * @param props.withPaper - When true, wraps the error state in a Paper container.
 */
export const ErrorState = (props: Props) => {
  const { errorText, withPaper } = props;

  const content = (
    <ZeroErrorState>
      <ZeroErrorIcon icon="error-cloud" />
      {errorText ? (
        <ZeroErrorTitle>{errorText}</ZeroErrorTitle>
      ) : (
        <>
          <ZeroErrorTitle>{ERROR_STATE_TITLE}</ZeroErrorTitle>
          <ZeroErrorDescription>{ERROR_STATE_TEXT}</ZeroErrorDescription>
        </>
      )}
    </ZeroErrorState>
  );

  if (withPaper) {
    return <Paper>{content}</Paper>;
  }

  return content;
};
