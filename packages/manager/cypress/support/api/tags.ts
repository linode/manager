import { deleteTag, getTags } from '@linode/api-v4/lib/tags';
import { isTestLabel } from './common';

/**
 * Delete all tags whose labels are prefixed "cy-test-".
 */
export const deleteAllTestTags = () => {
  getTags().then((resp) => {
    resp.data.forEach((tag) => {
      if (isTestLabel(tag.label)) {
        deleteTag(tag.label);
      }
    });
  });
};
