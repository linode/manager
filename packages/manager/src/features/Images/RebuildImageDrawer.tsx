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

interface RebuildImageFormState {
  linodeId: number;
}

export const RebuildImageDrawer = (props: Props) => {
  const { image, onClose, open } = props;

  const history = useHistory();
  const {
    canCreateImage,
    permissionedLinodes: availableLinodes,
  } = useImageAndLinodeGrantCheck();

  const { control, formState, handleSubmit } = useForm<RebuildImageFormState>({
    mode: 'onBlur',
  });

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
      {!canCreateImage ? (
        <Notice
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          variant="error"
        />
      ) : null}
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
            clearable={false}
            disabled={!canCreateImage}
            errorText={fieldState.error?.message}
            value={field.value}
          />
        )}
        control={control}
        name="linodeId"
      />

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: !formState.isValid || !canCreateImage,
          label: 'Restore Image',
          loading: formState.isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
