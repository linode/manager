import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { resetEventsPolling } from 'src/events';
import { resizeVolume } from 'src/services/volumes';
import { ResizeVolumeSchema } from 'src/services/volumes/volumes.schema';
import PricePanel from './PricePanel';
import SizeField from './SizeField';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
  volumeSize: number;
  volumeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ResizeVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { volumeId, volumeSize, onClose } = props;
  const initialValues = { size: volumeSize };
  const validationSchema = ResizeVolumeSchema(volumeSize);

  return (
    <Formik
      validateOnChange={false}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm, setSubmitting, setStatus, setErrors }) => {

        setSubmitting(true);

        resizeVolume(volumeId, { size: Number(values.size) })
          .then(response => {
            onClose();
            resetForm();
            resetEventsPolling();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to resize this volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) => setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
          });
      }}
      initialValues={initialValues}
      render={(formikProps) => {
        const {
          values,
          handleChange,
          handleBlur,
          errors,
          handleSubmit,
          isSubmitting,
          resetForm
        } = formikProps;

        return (
          <Form>

            <SizeField
              error={errors.size}
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.size}
            />

            <PricePanel value={values.size} currentSize={volumeSize} />

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

export default styled(ResizeVolumeForm);
