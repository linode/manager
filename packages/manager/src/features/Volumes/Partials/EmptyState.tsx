import {
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react/ZeroErrorState';
import React from 'react';

interface Props {
  message?: string;
}

export const EmptyState = ({ message }: Props) => {
  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="doc-no-selection" />
      <ZeroErrorTitle>{message ?? 'No data to display'}</ZeroErrorTitle>
    </ZeroErrorState>
  );
};
