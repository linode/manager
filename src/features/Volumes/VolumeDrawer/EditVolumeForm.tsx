import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { compose } from 'recompose';
import TagsInput, { Tag } from 'src/components/TagsInput';
import withVolumesRequest, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { updateVolumes$ } from 'src/features/Volumes/WithEvents';
import { UpdateVolumeSchema } from 'src/services/volumes/volumes.schema';
import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  onClose: () => void;
  volumeLabel: string;
  volumeTags: Tag[];
  volumeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames> & VolumesRequests;

/** Single field posts like rename/resize dont have validation schemas in services */
const validationSchema = UpdateVolumeSchema;
interface FormState {
  label: string;
  tags: Tag[];
}

const RenameVolumeForm: React.StatelessComponent<CombinedProps> = props => {
  const { volumeId, volumeLabel, volumeTags, onClose, updateVolume } = props;
  const initialValues: FormState = { label: volumeLabel, tags: volumeTags };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        const { label, tags } = values;

        setSubmitting(true);

        updateVolume({
          volumeId,
          label,
          tags: tags.map(v => v.value)
        })
          .then(response => {
            resetForm();
            updateVolumes$.next(true);
            onClose();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to rename this volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) =>
              setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(
              mapErrorToStatus,
              errorResponse,
              defaultMessage
            );
          });
      }}
      initialValues={initialValues}
      render={formikProps => {
        const {
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldValue,
          status,
          touched,
          values
        } = formikProps;
        return (
          <Form>
            {status && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}

            <LabelField
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
              name="tags"
              label="Tags"
              onChange={selected => setFieldValue('tags', selected)}
              value={values.tags}
            />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
            />
          </Form>
        );
      }}
    />
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumesRequest
)(RenameVolumeForm);

export default enhanced;
