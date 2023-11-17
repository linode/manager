import React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

export const ROUTE_COPY = {
  Description: {
    http: (
      <Stack spacing={1}>
        <Typography>
          Routes have a unique label and rules. Routes define how the load
          balancer directs incoming requests to service targets. After a route
          is created, you add rules to set conditions that are used for target
          selection.
        </Typography>
        <Typography>
          For HTTP and HTTPS load balancers, in addition to setting the
          percentage of incoming requests to a target, other match conditions
          such as the url path prefix can be added to the route rules.
        </Typography>
      </Stack>
    ),
    tcp: (
      <Stack spacing={1}>
        <Typography>
          Routes have a unique label and rules. Routes define how the load
          balancer directs incoming requests to service targets. After a route
          is created, you add rules to set conditions that are used for target
          selection.
        </Typography>
        <Typography>
          TCP rules include the percentage of incoming requests that should be
          directed to each target.
        </Typography>
      </Stack>
    ),
  },
  Rule: {
    Description:
      'Rules set the conditions that are used for target selection. TCP rules include the percentage of incoming requests that should be directed to each target.',
    MatchRule: {
      http:
        'A rule consists of a match type, and a pattern to match on called a match value. Each rule can specify only one field or pattern pair.',
      tcp:
        'For TCP load balancers, a rule consists of service targets and the percentage of incoming requests that should be directed to each target. Add as many service targets as required but the percentages for all targets must total 100%.',
    },
  },
};
