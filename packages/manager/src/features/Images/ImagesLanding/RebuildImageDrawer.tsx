import { Divider, Stack } from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';

import { REBUILD_LINODE_IMAGE_PARAM_NAME } from '../../Linodes/LinodesDetail/LinodeRebuild/RebuildFromImage';
import { useImageAndLinodeGrantCheck } from '../utils';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  onClose: () => void;
  open: boolean;
}

export const RebuildImageDrawer = (props: Props) => {
  const { image, onClose, open } = props;

  const history = useHistory();
  const {
    permissionedLinodes: availableLinodes,
  } = useImageAndLinodeGrantCheck();

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

    onClose();

    history.push({
      pathname: `/linodes/${values.linodeId}/rebuild`,
      search: new URLSearchParams({
        [REBUILD_LINODE_IMAGE_PARAM_NAME]: image.id,
      }).toString(),
    });
  });

  return (
    <Drawer
      onClose={onClose}
      onExited={reset}
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
          render={({ field, fieldState }) => (
            <LinodeSelect
              onSelectionChange={(linode) => {
                field.onChange(linode?.id);
              }}
              optionsFilter={(linode) =>
                availableLinodes ? availableLinodes.includes(linode.id) : true
              }
              clearable={true}
              errorText={fieldState.error?.message}
              onBlur={field.onBlur}
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
          control={control}
          name="linodeId"
        />

        <ActionsPanel
          primaryButtonProps={{
            label: 'Rebuild Linode',
            loading: formState.isSubmitting,
            onClick: onSubmit,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
          style={{ marginTop: 16 }}
        />
      </Stack>
    </Drawer>
  );
};
