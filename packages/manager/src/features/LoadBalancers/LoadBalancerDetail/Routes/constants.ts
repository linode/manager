export const ROUTE_COPY = {
  Description: {
    http:
      'For HTTP and HTTPS load balancers, in addition to setting the percentage of incoming requests to a target, other match conditions such as the url path prefix can be added to the route rules. ',
    main:
      'Routes have a unique label and rules. Routes define how the load balancer directs incoming requests to service targets. After a route is created, you add rules to set conditions that are used for target selection.',
    tcp:
      'TCP rules include the percentage of incoming requests that should be directed to each target.',
  },
  Rule: {
    Description:
      'Rules set the conditions that are used for target selection. TCP rules include the percentage of incoming requests that should be directed to each target.',
    Hostname:
      'The hostname of the target where the rule applies. If a hostname is not specified, the rule applies to all targets. Wildcards (*) are supported.',
    MatchRule: {
      http:
        'A rule consists of a match type, and a pattern to match on called a match value. Each rule can specify only one field or pattern pair.',
      tcp:
        'For TCP load balancers, a rule consists of service targets and the percentage of incoming requests that should be directed to each target. Add as many service targets as required, but the percentages for all targets must total 100%.',
    },
    MatchValue: {
      header: 'The format for http header is: X-name=value.',
      host: '',
      method: 'The request methods include: DELETE, GET, HEAD, POST, and PUT.',
      path_prefix:
        'The format of the path rule is: /pathname1/pathame2. The initial slash is required, but the trailing slash is not.',
      query:
        'The format for query string is: ?name=value. The query string name must be preceded by a question mark (?).',
    },
    Stickiness: {
      Cookie:
        'The name that is used to obtain cookie value from the downstream HTTP application.',
      CookieType:
        'Global Load Balancer supports session stickiness using load balancer generated cookies or origin generated cookies. Selecting "Load Balancer Generated" generates an affinity cookie. Load Balancer Generated cookie expiry is configurable using Stickiness TTL.  If you are using an "Origin Generated" cookie, enter the "Cookie Key".',
      Description:
        'Controls how subsequent requests from the same user are routed. When enabled, subsequent requests, by the same user to the same load balancer, are sent to the same service target for the duration of the cookie and as long as the target remains healthy. If the target is unhealthy, a different target is selected. When Session Stickiness is disabled, no session information is saved and requests are routed in accordance with the algorithm and rules.',
      TTL:
        'Entering an expiry time sets the duration for the HTTP/S load balancer generated cookie.',
    },
  },
};
