import { UpdateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Tag, TagsInput } from 'src/components/TagsInput/TagsInput';
import { useUpdateVolumeMutation } from 'src/queries/volumes';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import VolumesActionsPanel from './VolumesActionsPanel';

interface Props {
  onClose: () => void;
  readOnly?: boolean;
  volumeId: number;
  volumeLabel: string;
  volumeTags: Tag[];
}

export const EditVolumeForm = (props: Props) => {
  const { onClose, readOnly, volumeId, volumeLabel, volumeTags } = props;

  const {
    dirty,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status,
    touched,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { label: volumeLabel, tags: volumeTags },
    onSubmit: (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
      const { label, tags } = values;

      setSubmitting(true);

      updateVolume({
        label,
        tags: tags.map((v) => v.value),
        volumeId,
      })
        .then((_) => {
          resetForm();
          onClose();
        })
        .catch((errorResponse) => {
          const defaultMessage = `Unable to edit this Volume at this time. Please try again later.`;
          const mapErrorToStatus = (generalError: string) =>
            setStatus({ generalError });

          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        });
    },
    validationSchema: UpdateVolumeSchema,
  });

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <NoticePanel error={status.generalError} success={status.success} />
      )}
      {readOnly && (
        <Notice
          important
          variant="error"
          text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
        />
      )}

      <LabelField
        disabled={readOnly}
        error={errors.label}
        name="label"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.label}
      />

      <TagsInput
        tagError={
          touched.tags
            ? errors.tags
              ? 'Unable to tag volume.'
              : undefined
            : undefined
        }
        disabled={readOnly}
        label="Tags"
        name="tags"
        onChange={(selected) => setFieldValue('tags', selected)}
        value={values.tags}
      />

      <VolumesActionsPanel
        onCancel={() => {
          resetForm();
          onClose();
        }}
        disabled={readOnly || !dirty}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        submitText="Save Changes"
      />
    </form>
  );
};
