import { randomString } from '../util/random';
import { getAll, deleteByLabel } from './common';
//import { deleteTag } from '@linode/api-v4/lib/tags';
import { isTestLabel } from './common';

const relativeApiPath = 'tags';

/**
 * Returns a test tag label.
 *
 * Tag label is prefixed with "cy-test-" so that it can be cleaned up later.
 *
 * @returns Cypress test tag label.
 */
export const makeTagLabel = () => {
  const randomTagOptions = {
    lowercase: true,
    uppercase: false,
    numbers: false,
    symbols: false,
    spaces: false,
  };

  return `cy-test-${randomString(5, randomTagOptions)}`;
};

/**
 * Get an API response containing all tags.
 *
 * @returns HTTP response containing all tags.
 */
export const getTags = () => getAll(relativeApiPath);

/**
 * Delete a tag by label.
 *
 * @param label Label of tag to delete.
 */
export const deleteTagByLabel = (label: string) => deleteByLabel('tags', label);

/**
 * Delete all tags whose labels are prefixed "cy-test-".
 */
export const deleteAllTestTags = () => {
  getTags().then((resp) => {
    resp.body.data.forEach((tag) => {
      if (isTestLabel(tag.label)) {
        deleteTagByLabel(tag.label);
      }
    });
  });
};
