import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme, toPassAxeCheck } from 'src/utilities/testHelpers';
import AutoBackups from './AutoBackups';

const TEST_TIMEOUT_MS = 10000;

expect.extend(toPassAxeCheck);

describe('AutoBackups simple sanity check', () => {
  it(
    'not managed not auto backups with linodes nobackups',
    async () => {
      const openDrawer = vi.fn();
      const props = {
        isManagedCustomer: false,
        backups_enabled: false,
        onChange: vi.fn(),
        openBackupsDrawer: openDrawer,
        hasLinodesWithoutBackups: true,
      };
      const res = renderWithTheme(<AutoBackups {...props} />);
      expect(res).toPassAxeCheck();
    },
    TEST_TIMEOUT_MS
  );
});
