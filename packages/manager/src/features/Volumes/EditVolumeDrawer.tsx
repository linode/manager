import { Volume } from '@linode/api-v4';
import { UpdateVolumeSchema } from '@linode/validation';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { useGrants } from 'src/queries/profile';
import { useUpdateVolumeMutation } from 'src/queries/volumes';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

export const EditVolumeDrawer = (props: Props) => {
  const { onClose, open, volume } = props;

  const { data: grants } = useGrants();

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

  const {
    dirty,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status: error,
    touched,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { label: volume?.label, tags: volume?.tags },
    async onSubmit(values, { setErrors, setStatus }) {
      try {
        await updateVolume({
          label: values.label ?? '',
          tags: values.tags,
          volumeId: volume?.id ?? -1,
        });

        onClose();
      } catch (error) {
        handleFieldErrors(setErrors, error);
        handleGeneralErrors(
          setStatus,
          error,
          `Unable to edit this Volume at this time. Please try again later.`
        );
      }
    },
    validationSchema: UpdateVolumeSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Edit Volume">
      <form onSubmit={handleSubmit}>
        {isReadOnly && (
          <Notice
            spacingBottom={0}
            text="You don't have permission to edit this volume."
            variant="error"
          />
        )}
        {error && <Notice text={error} variant="error" />}
        <TextField
          disabled={isReadOnly}
          errorText={errors.label}
          label="Label"
          name="label"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values.label}
        />
        <TagsInput
          onChange={(selected) =>
            setFieldValue(
              'tags',
              selected.map((item) => item.value)
            )
          }
          tagError={
            touched.tags
              ? errors.tags
                ? 'Unable to tag volume.'
                : undefined
              : undefined
          }
          disabled={isReadOnly}
          label="Tags"
          name="tags"
          value={values.tags?.map((t) => ({ label: t, value: t })) ?? []}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: isReadOnly || !dirty,
            label: 'Save Changes',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => {
              resetForm();
              onClose();
            },
          }}
        />
      </form>
    </Drawer>
  );
};
