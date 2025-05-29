import { Notice } from '@linode/ui';
import * as React from 'react';

import type { NoticeProps } from '@linode/ui';

export const PremiumCPUPlanNotice = (props: NoticeProps) => {
  return (
    <Notice variant="info" {...props}>
      To accommodate Enterprise workloads, especially where potential resource
      contention can impact your workloads, using Premium instances is highly
      recommended and required to achieve peak performance.
    </Notice>
  );
};
