import { Tag } from '@linode/api-v4/types';
import { deleteTag, getTags } from '@linode/api-v4/lib/tags';
import { depaginate } from 'support/util/paginate';
import { isTestLabel } from './common';

/**
 * Delete all tags whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when tags have been deleted or rejects on HTTP error.
 */
export const deleteAllTestTags = async (): Promise<void> => {
  const tags = await depaginate<Tag>((page: number) =>
    getTags({ page_size: 500, page })
  );
  const testTags = tags.filter((tag: Tag) => isTestLabel(tag.label));
  for (const testTag of testTags) {
    // Accounts can have thousands of tags, so we want to send these requests
    // sequentially to avoid overloading the API.
    // eslint-disable-next-line no-await-in-loop
    await deleteTag(testTag.label);
  }
};
