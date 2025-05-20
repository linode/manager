import { deleteStackScript, getStackScripts } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

import type { Filter, StackScript } from '@linode/api-v4';

// Retrieve only private StackScripts with "cy-test-" in label.
const userStackScriptFilter: Filter = {
  '+and': [
    {
      label: {
        '+contains': 'cy-test-',
      },
    },
    {
      is_public: false,
    },
  ],
};

/**
 * Delete all StackScripts whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when StackScripts have been deleted.
 */
export const deleteAllTestStackScripts = async (): Promise<void> => {
  const stackScripts = await depaginate<StackScript>((page: number) =>
    getStackScripts({ page, page_size: pageSize }, userStackScriptFilter)
  );

  const deletionPromises = stackScripts
    // This shouldn't be necessary because of user filter, but we'll filter
    // non-test StackScripts just to be safe.
    .filter((stackScript: StackScript) => isTestLabel(stackScript.label))
    .map((stackScript: StackScript) => deleteStackScript(stackScript.id));

  await Promise.all(deletionPromises);
};
