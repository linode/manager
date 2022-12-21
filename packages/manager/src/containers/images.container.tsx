import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import { useImagesQuery } from 'src/queries/images';
import { listToItemsByID } from 'src/queries/base';
import { Image } from '@linode/api-v4';

export interface DefaultProps {
  imagesData: Record<string, Image>;
  imagesError?: APIError[];
  imagesLoading: boolean;
  imagesLastUpdated: number;
  //   requestImages: () => Promise<Image[]>;
}

/**
 * This is modeled after regions.container.tsx.

 * Simple wrapper around our Images query. Originally this data was grabbed via Redux;
 * it is being retained in this way because there are still a few places
 * where Images data is needed in class components, some of which are difficult
 * or problematic to refactor.
 *
 * @todo: This file can be deleted once the existing class components have been removed or converted
 * to FCs (current list is: SelectPlanPanel/SelectPlanQuantityPanel; NodeBalancerCreate; LinodeSelect;
 * LinodeCreate/LinodeCreateContainer). Please do NOT use this wrapper for any future components; if a class
 * component is needed, best practice is to include an FC container above it (the routing level often works well)
 * and pass regions through there.
 */
type Wrapper = (
  Component: React.ComponentType<DefaultProps>
) => React.FC<unknown>;
const imagesContainer: Wrapper = (
  Component: React.ComponentType<DefaultProps>
) => (props) => {
  const { data, error, isLoading, dataUpdatedAt } = useImagesQuery({}, {});

  const _imagesData = listToItemsByID(data?.data ?? []);
  return (
    <Component
      imagesData={_imagesData}
      imagesLastUpdated={dataUpdatedAt}
      imagesError={error ?? undefined}
      imagesLoading={isLoading}
      {...props}
    />
  );
};

export default imagesContainer;
