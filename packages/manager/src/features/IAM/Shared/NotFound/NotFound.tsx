import {
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import React from 'react';

export const NotFound = () => {
  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="error-cloud" />
      <ZeroErrorTitle>Not Found</ZeroErrorTitle>
      <ZeroErrorDescription>This page does not exist.</ZeroErrorDescription>
    </ZeroErrorState>
  );
};
