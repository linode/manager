import { createLazyRoute } from '@tanstack/react-router';

import { OperatingSystems } from 'src/features/Linodes/LinodeCreate/Tabs/OperatingSystems';

export const operatingSystemsLazyRoute = createLazyRoute('/linodes/create/os')({
  component: OperatingSystems,
});
