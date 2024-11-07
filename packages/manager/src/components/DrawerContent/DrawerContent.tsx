import { Notice } from '@linode/ui';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';

export interface DrawerContentProps {
  children: React.ReactNode;
  error: boolean;
  errorMessage?: string;
  loading: boolean;
  title: string;
}

export const DrawerContent = (props: DrawerContentProps) => {
  const { children, error, errorMessage, loading, title } = props;
  if (loading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <Notice spacingTop={8} variant="error">
        {errorMessage ?? `Couldn't load ${title}`}
      </Notice>
    );
  }
  // eslint-disable-next-line
  return <>{children}</>;
};
