import { Box } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

interface RuleSetDetailsViewProps {
  ruleset: number;
}

export const RuleSetDetailsView = (props: RuleSetDetailsViewProps) => {
  const { ruleset } = props;
  const prefixLists = ['pl:system:1', 'pl:system:2'];

  return (
    <>
      Rule Set ID: {ruleset}
      <Box marginTop={4}>
        {prefixLists.map((pl) => (
          <>
            <Link key={pl} onClick={() => {}}>
              {pl}
            </Link>
            &nbsp;
          </>
        ))}
      </Box>
    </>
  );
};
