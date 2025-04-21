import { Notice } from '@linode/ui';
import * as React from 'react';

import type { NoticeProps } from '@linode/ui';

export const PremiumCPUPlanNotice = (props: NoticeProps) => {
  return (
    <Notice variant="info" {...props}>
      Select Premium CPU instances for scenarios where low latency or high
      throughput is expected.
    </Notice>
  );
};
