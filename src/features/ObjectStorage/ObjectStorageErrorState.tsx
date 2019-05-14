import * as React from 'react';
import ErrorState from 'src/components/ErrorState';

export const ObjectStorageErrorState: React.FC<{}> = () => {
  return (
    <ErrorState errorText="An error has occurred. Please reload and try again." />
  );
};

export default ObjectStorageErrorState;
