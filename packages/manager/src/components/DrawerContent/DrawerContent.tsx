import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Notice from 'src/components/Notice';

export interface Props {
  title: string;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}

export const DrawerContent = (props: Props) => {
  const { title, loading, error, errorMessage, children } = props;
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

export default DrawerContent;
