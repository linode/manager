import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';

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
      <Notice error spacingTop={8}>
        {errorMessage ?? `Couldn't load ${title}`}
      </Notice>
    );
  }
  // eslint-disable-next-line
  return <>{children}</>;
};
