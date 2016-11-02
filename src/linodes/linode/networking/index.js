import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  IndexPage,
  SummaryPage,
  IPRemovalPage,
  IPTransferPage,
  ReverseDNSPage,
  IPSharingPage,
} from './layouts';

export default (
  <Route path="networking" component={IndexPage}>
    <IndexRoute component={SummaryPage} />
    <Route path="ipremoval" component={IPRemovalPage} />
    <Route path="iptransfer" component={IPTransferPage} />
    <Route path="reversedns" component={ReverseDNSPage} />
    <Route path="ipsharing" component={IPSharingPage} />
  </Route>
);
