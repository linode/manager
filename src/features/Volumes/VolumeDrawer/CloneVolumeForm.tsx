import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { resetEventsPolling } from 'src/events';
import { cloneVolume } from 'src/services/volumes';
import { CloneVolumeSchema } from 'src/services/volumes/volumes.schema';
import LabelField from './LabelField';
import PricePanel from './PricePanel';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
  volumeId: number;
  volumeLabel: string;
  volumeSize: number;
  volumeRegion: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const validationScheme = CloneVolumeSchema;

const initialValues = { label: '' };

const CloneVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClose, volumeId, volumeRegion, volumeLabel, volumeSize } = props;
  return (
    <Formik
      validateOnChange={false}
      validationSchema={validationScheme}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        cloneVolume(volumeId, { label: values.label })
          .then(response => {
            onClose();
            resetEventsPolling();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to clone this volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) => setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
          })

      }}
      initialValues={initialValues}
      render={({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, resetForm, values }) => {
        return (
          <Form>
            <Typography variant="body2">{`The newly created volume will be an exact clone of ${volumeLabel}. It will have a size of ${volumeSize} GB and be available in ${volumeRegion}`}</Typography>
            <LabelField
              handleBlur={handleBlur}
              handleChange={handleChange}
              value={values.label}
              error={errors.label as string}
            />

            <PricePanel value={volumeSize} currentSize={volumeSize} />

            <VolumesActionsPanel
              onSubmit={handleSubmit}
              onCancel={() => { resetForm(initialValues); onClose() }}
              isSubmitting={isSubmitting}
            />
          </Form>
        );
      }}
    />
  );
};

const styled = withStyles(styles);

export default styled(CloneVolumeForm);
