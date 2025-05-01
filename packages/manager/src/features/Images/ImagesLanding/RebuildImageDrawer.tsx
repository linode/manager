import { LinodeSelect } from '@linode/shared';
import { ActionsPanel, Divider, Drawer, Notice, Stack } from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { NotFound } from 'src/components/NotFound';
import { REBUILD_LINODE_IMAGE_PARAM_NAME } from 'src/features/Linodes/LinodesDetail/LinodeRebuild/utils';

import { useImageAndLinodeGrantCheck } from '../utils';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}

export const RebuildImageDrawer = (props: Props) => {
  const { image, isFetching, onClose, open } = props;

  const history = useHistory();
  const { permissionedLinodes: availableLinodes } =
    useImageAndLinodeGrantCheck();

  const { control, formState, handleSubmit, reset } = useForm<{
    linodeId: number;
  }>({
    defaultValues: { linodeId: undefined },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    if (!image) {
      return;
    }

    handleClose();

    history.push({
      pathname: `/linodes/${values.linodeId}/rebuild`,
      search: new URLSearchParams({
        [REBUILD_LINODE_IMAGE_PARAM_NAME]: image.id,
      }).toString(),
    });
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title="Rebuild an Existing Linode from an Image"
    >
      <Stack marginTop={4}>
        {formState.errors.root?.message && (
          <Notice
            data-qa-notice
            text={formState.errors.root.message}
            variant="error"
          />
        )}

        <DescriptionList
          items={[{ description: image?.label ?? '', title: 'Image' }]}
        />

        <Divider spacingBottom={0} spacingTop={24} />

        <Controller
          control={control}
          name="linodeId"
          render={({ field, fieldState }) => (
            <LinodeSelect
              clearable={true}
              errorText={fieldState.error?.message}
              onBlur={field.onBlur}
              onSelectionChange={(linode) => {
                field.onChange(linode?.id);
              }}
              optionsFilter={(linode) =>
                availableLinodes ? availableLinodes.includes(linode.id) : true
              }
              placeholder="Select Linode or Type to Search"
              value={field.value}
            />
          )}
          rules={{
            required: {
              message: 'Select a Linode to restore.',
              value: true,
            },
          }}
        />

        <ActionsPanel
          primaryButtonProps={{
            label: 'Rebuild Linode',
            loading: formState.isSubmitting,
            onClick: onSubmit,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
          }}
          style={{ marginTop: 16 }}
        />
      </Stack>
    </Drawer>
  );
};
