import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import DatabaseDetailNavigation from './DatabaseDetailNavigation';
import DatabaseEntityDetail from './DatabaseEntityDetail';

type CombinedProps = RouteComponentProps<{ id: string }>;

const DatabaseDetail: React.FC<CombinedProps> = () => {
  return (
    <>
      <DatabaseEntityDetail database="" />
      <DatabaseDetailNavigation />
    </>
  );
};

export default compose<CombinedProps, {}>(React.memo)(DatabaseDetail);
