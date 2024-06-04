import { Image } from '@linode/api-v4';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';

import { REBUILD_LINODE_IMAGE_PARAM_NAME } from '../Linodes/LinodesDetail/LinodeRebuild/RebuildFromImage';
import { useImageAndLinodeGrantCheck } from './utils';

interface Props {
  image?: Image;
  onClose: () => void;
  open?: boolean;
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

  React.useEffect(() => {
    if (open) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit((values) => {
    if (!image) {
      return;
    }

    history.push({
      pathname: `/linodes/${values.linodeId}/rebuild`,
      search: new URLSearchParams({
        [REBUILD_LINODE_IMAGE_PARAM_NAME]: image.id,
      }).toString(),
    });

    onClose();
  });

  return (
    <Drawer onClose={onClose} open={open} title="Restore from Image">
      {formState.errors.root?.message && (
        <Notice
          data-qa-notice
          text={formState.errors.root.message}
          variant="error"
        />
      )}

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
          'data-testid': 'submit',
          label: 'Restore Image',
          loading: formState.isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
