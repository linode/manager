import {
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import React from 'react';

import { ERROR_STATE_TEXT_1, ERROR_STATE_TITLE } from '../constants';

interface Props {
  errorText?: string;
}
export const ErrorState = (props: Props) => {
  const { errorText } = props;

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="error-cloud" />
      {errorText ? (
        <ZeroErrorTitle>{errorText}</ZeroErrorTitle>
      ) : (
        <>
          <ZeroErrorTitle>{ERROR_STATE_TITLE}</ZeroErrorTitle>
          <ZeroErrorDescription>{ERROR_STATE_TEXT_1}</ZeroErrorDescription>
        </>
      )}
    </ZeroErrorState>
  );
};
