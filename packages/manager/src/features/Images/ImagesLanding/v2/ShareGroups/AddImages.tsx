import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useShareGroupQuery,
  useShareGroupsAddImagesMutation,
  useShareGroupsImagesQuery,
} from '@linode/queries';
import { Box, Button, CircleProgress, ErrorState, Paper } from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { useNavigate, useParams } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { IMAGE_SELECT_TABLE_SHARE_GROUP_ADD_IMAGES_PENDO_IDS } from 'src/components/ImageSelect/constants';
import { LandingHeader } from 'src/components/LandingHeader';

import { ADD_IMAGES_PENDO_IDS } from '../constants';
import { AddImagesPanel } from './AddImagesPanel';

import type { ShareGroupFormImage } from './AddImagesPanel';
import type {
  AddSharegroupImagesPayload,
  CreateSharegroupPayload,
} from '@linode/api-v4';

interface ShareGroupFormPayload
  extends Omit<CreateSharegroupPayload, 'images'> {
  images?: ShareGroupFormImage[];
}

export const AddImages = () => {
  const navigate = useNavigate();
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const { shareGroupId } = useParams({
    from: '/images/share-groups/owned-groups/$shareGroupId/add-images',
  });

  const {
    data: shareGroup,
    error: shareGroupError,
    isLoading,
  } = useShareGroupQuery(shareGroupId, !!shareGroupId);
  const { label } = shareGroup ?? {};

  const { data: images } = useShareGroupsImagesQuery(shareGroupId);

  // Get the source image IDs of the images that are already in the share group.
  // This is used to filter out images that are already in the share group from the list of images that can be added to the share group.
  const sourceImageIds =
    images?.data.map((image) =>
      String(image.image_sharing?.shared_by?.source_image_id)
    ) ?? [];

  const { mutateAsync: addImages } = useShareGroupsAddImagesMutation();

  const form = useForm<ShareGroupFormPayload>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const [selectedImages, setSelectedImages] = React.useState<
    ShareGroupFormImage[]
  >([]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (!values.images || values.images.length === 0) {
        setError('root', {
          message:
            'You must select at least one image to add to the Share Group.',
        });
        scrollErrorIntoViewV2(formContainerRef);
        return;
      }
      const payload: AddSharegroupImagesPayload = {
        images: values.images?.map(
          ({ imageId, label, description, useOriginalImageFields }, index) => {
            return useOriginalImageFields
              ? {
                  id: selectedImages[index].imageId,
                  label: selectedImages[index].label,
                  description: selectedImages[index].description,
                }
              : {
                  id: imageId,
                  label,
                  description,
                };
          }
        ),
      };

      await addImages({ data: payload, sharegroupId: Number(shareGroupId) });
      enqueueSnackbar('Image added successfully.', {
        variant: 'success',
      });
      navigate({
        search: () => ({}),
        to: '/images/share-groups/owned-groups/$shareGroupId',
        params: { shareGroupId },
      });
    } catch (errors) {
      for (const error of errors) {
        setError('root', { message: error.reason });
        scrollErrorIntoViewV2(formContainerRef);
      }
    }
  });

  if (shareGroupError) {
    return (
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacingFunction(4),
            p: `${theme.spacingFunction(24)} ${theme.spacingFunction(32)}`,
          })}
        >
          <ErrorState errorText="There was an error loading your share group. Please try again." />
        </Box>
      </Paper>
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Add Images" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              position: 1,
              label: 'Images',
            },
            {
              position: 2,
              label: 'Share Groups',
            },
            {
              position: 3,
              label: 'Owned Groups',
            },
            {
              position: 4,
              label: label ?? '',
            },
          ],
          pathname: `/images/share-groups/owned-groups/${shareGroupId}/add-images`,
        }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/image-sharing"
        pendoId={ADD_IMAGES_PENDO_IDS.landingHeader}
        spacingBottom={4}
        title="Add Images"
      />
      <FormProvider {...form}>
        <form onSubmit={onSubmit} ref={formContainerRef}>
          <Paper>
            {errors.root?.message && (
              <NotificationBanner
                className="error-for-scroll"
                style={{ marginTop: Spacing.S16, marginBottom: Spacing.S16 }}
                text={errors.root?.message}
                type="error"
              />
            )}
            <AddImagesPanel
              currentRoute="/images/share-groups/owned-groups/$shareGroupId/add-images"
              formControl={control}
              pendoIDs={IMAGE_SELECT_TABLE_SHARE_GROUP_ADD_IMAGES_PENDO_IDS}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              shareGroupImageIds={sourceImageIds}
              title="Add images to the share group"
            />
          </Paper>
          <Box display="flex" flexWrap="wrap" justifyContent="flex-end" mt={2}>
            <Button
              buttonType="primary"
              data-pendo-id={ADD_IMAGES_PENDO_IDS.addImagesButton}
              loading={isSubmitting}
              type="submit"
            >
              Add Images
            </Button>
          </Box>
        </form>
      </FormProvider>
    </>
  );
};
