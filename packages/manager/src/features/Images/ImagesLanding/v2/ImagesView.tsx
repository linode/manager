import { useImagesQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import { getEventsForImages, type ImagesVariant } from '../../utils';
import { IMAGES_CONFIG } from '../imagesConfig';
import { ImagesTable } from './ImagesTable';

import type { Handlers as ImageHandlers } from '../ImagesActionMenu';
import type { Filter } from '@linode/api-v4';

interface Props {
  filter: Filter;
  handlers: ImageHandlers;
  onFetchingChange?: (fetching: boolean) => void;
  variant: ImagesVariant;
}

export const ImagesView = (props: Props) => {
  const { filter, handlers, onFetchingChange, variant } = props;

  const config = IMAGES_CONFIG[variant];

  const navigate = useNavigate();
  const search = useSearch({ from: '/images' });

  const { data: permissions } = usePermissions('account', ['create_image']);
  const canCreateImage = permissions?.create_image;

  const pagination = usePaginationV2({
    currentRoute: '/images/images',
    preferenceKey: config.preferenceKey,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const {
    handleOrderChange: handleImagesOrderChange,
    order: imagesOrder,
    orderBy: imagesOrderBy,
  } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: config.orderDefault,
        orderBy: config.orderByDefault,
      },
      from: '/images/images',
    },
    preferenceKey: config.preferenceKey,
    prefix: config.type,
  });

  const imagesFilter: Filter = {
    ['+order']: imagesOrder,
    ['+order_by']: imagesOrderBy,
    ...filter,
  };

  const {
    data: images,
    error: imagesError,
    isFetching: imagesIsFetching,
    isLoading: imagesLoading,
  } = useImagesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      ...imagesFilter,
      is_public: false,
      type: config.type,
    },
    {
      enabled: config.isEnabled(search.subType),
      // Refetch custom images every 30 seconds.
      // We do this because we have no /v4/account/events we can use
      // to update Image region statuses. We should make the API
      // team and Images team implement events for this.
      refetchInterval: 30_000,
      // If we have a search query, disable retries to keep the UI
      // snappy if the user inputs an invalid X-Filter. Otherwise,
      // pass undefined to use the default retry behavior.
      retry: search.query ? false : undefined,
    }
  );

  const { events } = useEventsInfiniteQuery();

  const imageEvents =
    events?.filter(
      (event) =>
        isEventInProgressDiskImagize(event) || isEventImageUpload(event)
    ) ?? [];

  // Private images with the associated events tied in.
  const imagesEvents = getEventsForImages(images?.data ?? [], imageEvents);

  // Notifies parent (search) whenever fetching changes
  React.useEffect(() => {
    onFetchingChange?.(imagesIsFetching);
  }, [imagesIsFetching, onFetchingChange]);

  if (imagesLoading) {
    return <CircleProgress />;
  }

  if (!search.query && imagesError) {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState errorText="There was an error retrieving your images. Please reload and try again." />
      </React.Fragment>
    );
  }

  return (
    <ImagesTable
      columns={config.columns}
      emptyMessage={config.emptyMessage}
      error={imagesError}
      eventCategory={config.eventCategory}
      events={imagesEvents}
      handleOrderChange={handleImagesOrderChange}
      handlers={handlers}
      headerProps={{
        title: config.title,
        buttonProps: config.buttonProps
          ? {
              buttonText: config.buttonProps.buttonText,
              onButtonClick: () =>
                navigate({
                  search: () => ({}),
                  to: config.buttonProps?.navigateTo ?? '/',
                }),
              disabled: !canCreateImage,
              tooltipText: !canCreateImage
                ? config.buttonProps.disabledToolTipText
                : undefined,
            }
          : undefined,
        docsLink: config.docsLink,
        description: config.description,
      }}
      images={images?.data ?? []}
      order={imagesOrder}
      orderBy={imagesOrderBy}
      pagination={{
        page: pagination.page,
        pageSize: pagination.pageSize,
        count: images?.results ?? 0,
        handlePageChange: pagination.handlePageChange,
        handlePageSizeChange: pagination.handlePageSizeChange,
      }}
      query={search.query}
    />
  );
};
