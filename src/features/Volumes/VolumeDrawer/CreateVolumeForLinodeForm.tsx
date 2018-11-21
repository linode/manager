/**
 * @todo Display the volume configuration information on success.
 */
import { Form, Formik } from 'formik';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { resetEventsPolling } from 'src/events';
import { createVolume } from 'src/services/volumes';
import { CreateVolumeSchema } from 'src/services/volumes/volumes.schema.ts';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import PricePanel from './PricePanel';
import SizeField from './SizeField';
import { handleFieldErrors, handleGeneralErrors, maybeCastToNumber } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
}

type CombinedProps =
  & Props
  & WithStyles<ClassNames>;

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClose, linodeId, linodeLabel, linodeRegion } = props;

  return (
    <Formik
      validateOnChange={false}
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(values, { resetForm, setSubmitting, setStatus, setErrors }) => {
        const { label, size, configId } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          linode_id: maybeCastToNumber(linodeId),
          config_id: maybeCastToNumber(configId),
        })
          .then(response => {
            resetForm(initialValues);
            setStatus({ success: `Volume scheduled for creation.` });
            resetEventsPolling();
            setSubmitting(false);
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to create a volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) => setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
          });
      }}
      render={(formikProps) => {
        const {
          values,
          handleChange,
          handleBlur,
          setFieldValue,
          errors,
          isSubmitting,
          handleSubmit,
          resetForm,
          status,
        } = formikProps;

        return (
          <Form>
            {status && status.success && <Notice success>{status.success}</Notice>}

            {status && status.generalError && <Notice error>{status.generalError}</Notice>}

            <Typography variant="body1">
              {`This volume will be immediately scheduled for attachment to ${linodeLabel} and available to other Linodes in the ${linodeRegion} data-center.`}
            </Typography>

            <Typography variant="body1">
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes in size and costs
              $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.
            </Typography>

            <LabelField
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.label}
              value={values.label}
            />

            <SizeField onChange={handleChange} onBlur={handleBlur} error={errors.size} value={values.size} />

            <ConfigSelect
              error={errors.configId}
              onChange={(id: string) => setFieldValue('configId', id)}
              linodeId={linodeId}
              name="configId"
              onBlur={handleBlur}
              value={values.configId}
            />

            <PricePanel value={values.size} currentSize={10} />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => { resetForm(initialValues); onClose(); }}
            />
          </Form>
        )
      }} />
  );
};

const initialValues = {
  label: '',
  size: 20,
  region: 'none',
  linodeId: '',
  configId: '',
};

const styled = withStyles(styles);

export default styled(CreateVolumeForm);

