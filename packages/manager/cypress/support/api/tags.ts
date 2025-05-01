import { deleteTag, getTags } from '@linode/api-v4/lib/tags';
import { pageSize } from 'support/constants/api';
import { entityTag } from 'support/constants/cypress';
import { depaginate } from 'support/util/paginate';

import type { Tag } from '@linode/api-v4';

/**
 * Delete all tags whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when tags have been deleted or rejects on HTTP error.
 */
export const deleteAllTestTags = async (): Promise<void> => {
  const tags = await depaginate<Tag>((page: number) =>
    getTags({ page, page_size: pageSize })
  );
  const testTags = tags.filter((tag: Tag) => tag.label.startsWith(entityTag));
  for (const testTag of testTags) {
    // Accounts can have thousands of tags, so we want to send these requests
    // sequentially to avoid overloading the API.
    // eslint-disable-next-line no-await-in-loop
    await deleteTag(testTag.label);
  }
};
