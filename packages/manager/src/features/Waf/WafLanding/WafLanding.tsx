import React from 'react';

import { Link } from 'src/components/Link';

export const WafLanding = () => {
  return (
    <div>
      WafLanding works!
      {/*TODO - below links are added for testing routes - remove when implementing actual landing page and components*/}
      <Link to={`/waf/123`}>Waf Details</Link>
      <Link to={`/waf/create`}>Waf Create</Link>
    </div>
  );
};
