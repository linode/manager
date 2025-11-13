import { getImages } from '@linode/api-v4';

import type { CypressPlugin } from './plugin';
import type { Image, ResourcePage } from '@linode/api-v4';

/**
 * Fetches and stores Linode image data in Cypress environment object.
 */
export const fetchLinodeImages: CypressPlugin = async (_, config) => {
  const data: ResourcePage<Image> = await getImages({ page_size: 500 });

  const images = data.data;
  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerImages: images,
    },
  };
};
