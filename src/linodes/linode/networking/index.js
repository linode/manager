import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  IndexPage,
  SummaryPage,
  DNSResolversPage,
  IPTransferPage,
  IPSharingPage,
} from './layouts';


export default (
  <Route path="networking" component={IndexPage}>
    <IndexRoute component={SummaryPage} />
    <Route path="resolvers" component={DNSResolversPage} />
    <Route path="transfer" component={IPTransferPage} />
    <Route path="sharing" component={IPSharingPage} />
  </Route>
);
