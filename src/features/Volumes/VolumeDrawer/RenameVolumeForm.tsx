import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { updateVolumes$ } from 'src/features/Volumes/WithEvents';
import { updateVolume } from 'src/services/volumes';
import { UpdateVolumeSchema } from 'src/services/volumes/volumes.schema';
import LabelField from './LabelField';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
  volumeLabel: string;
  volumeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

/** Single field posts like rename/resize dont have validation schemas in services */
const validationSchema = UpdateVolumeSchema;

const RenameVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { volumeId, volumeLabel, onClose } = props;
  const initialValues = { label: volumeLabel };

  return (
    <Formik
      validateOnChange={false}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm, setSubmitting, setStatus, setErrors }) => {

        setSubmitting(true);

        updateVolume(volumeId, { label: values.label })
          .then(response => {
            resetForm();
            updateVolumes$.next(true);
            onClose();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to rename this volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) => setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
          });
      }}
      initialValues={initialValues}
      render={(formikProps) => {
        const {
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          resetForm,
          values,
        } = formikProps;
        return (
          <Form>

            <LabelField
              error={errors.label}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => { resetForm(); onClose(); }}
            />

          </Form>
        );
      }}
    />
  );
};


const styled = withStyles(styles);

export default styled(RenameVolumeForm);
