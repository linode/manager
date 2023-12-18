import { Image } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';

export interface DefaultProps {
  imagesData: Record<string, Image>;
  imagesError?: APIError[];
  imagesLastUpdated: number;
  imagesLoading: boolean;
}

/**
 * This is modeled after regions.container.tsx.

 * Simple wrapper around our Images query. Originally this data was grabbed via Redux;
 * it is being retained in this way because there are still a few places
 * where Images data is needed in class components, some of which are difficult
 * or problematic to refactor.
 *
 * @todo: This file can be deleted once the existing class components have been removed or converted
 * to FCs (these include: LinodeCreateContainer/LinodeCreate, StackScriptCreate, LinodesLanding).
 * Please do NOT use this wrapper for any future components; if a class component is needed,
 * best practice is to include an FC container above it (the routing level often works well)
 * and pass the data through there.
 */

const imagesContainer = <Props,>(
  Component: React.ComponentType<DefaultProps & Props>
) => (props: Props) => {
  const { data, dataUpdatedAt, error, isLoading } = useAllImagesQuery();

  const _imagesData = listToItemsByID(data ?? []);
  return (
    <Component
      imagesData={_imagesData}
      imagesError={error ?? undefined}
      imagesLastUpdated={dataUpdatedAt}
      imagesLoading={isLoading}
      {...props}
    />
  );
};

export default imagesContainer;
