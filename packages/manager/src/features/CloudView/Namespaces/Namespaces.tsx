import * as React from 'react';

import { Paper } from 'src/components/Paper';
// import { useCloudViewNameSpacesQuery } from 'src/queries/cloudview/namespaces';

export const Namespaces = React.memo(() => {
  // const {
  //   data: namespaces,
  //   isError,
  //   isLoading,
  // } = useCloudViewNameSpacesQuery();
  // const testdata: any = namespaces?.data;
  // eslint-disable-next-line no-console
  // console.log(testdata, isLoading, isError);
  return <Paper>Namespaces Content here</Paper>;
});
