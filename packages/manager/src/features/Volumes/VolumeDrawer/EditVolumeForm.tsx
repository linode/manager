import { UpdateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import * as React from 'react';
import Notice from 'src/components/Notice';
import TagsInput, { Tag } from 'src/components/TagsInput';
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
  volumeLabel: string;
  volumeTags: Tag[];
  volumeId: number;
  readOnly?: boolean;
}

export const EditVolumeForm = (props: Props) => {
  const { volumeId, volumeLabel, volumeTags, onClose, readOnly } = props;

  const {
    resetForm,
    handleSubmit,
    status,
    errors,
    values,
    setFieldValue,
    handleBlur,
    handleChange,
    touched,
    isSubmitting,
    dirty,
  } = useFormik({
    enableReinitialize: true,
    validationSchema: UpdateVolumeSchema,
    initialValues: { label: volumeLabel, tags: volumeTags },
    onSubmit: (values, { resetForm, setSubmitting, setStatus, setErrors }) => {
      const { label, tags } = values;

      setSubmitting(true);

      updateVolume({
        volumeId,
        label,
        tags: tags.map((v) => v.value),
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
  });

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <NoticePanel success={status.success} error={status.generalError} />
      )}
      {readOnly && (
        <Notice
          text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
          error={true}
          important
        />
      )}

      <LabelField
        error={errors.label}
        name="label"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.label}
        disabled={readOnly}
      />

      <TagsInput
        tagError={
          touched.tags
            ? errors.tags
              ? 'Unable to tag volume.'
              : undefined
            : undefined
        }
        name="tags"
        label="Tags"
        onChange={(selected) => setFieldValue('tags', selected)}
        value={values.tags}
        disabled={readOnly}
      />

      <VolumesActionsPanel
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        disabled={readOnly || !dirty}
        onCancel={() => {
          resetForm();
          onClose();
        }}
        submitText="Save Changes"
      />
    </form>
  );
};
