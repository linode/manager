/**
 * @todo Display the volume configuration information on success.
 */
import { Form, Formik } from 'formik';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { createVolume } from 'src/services/volumes';
import { CreateVolumeSchema } from 'src/services/volumes/volumes.schema.ts';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import LinodeSelect from './LinodeSelect';
import PricePanel from './PricePanel';
import RegionSelect from './RegionSelect';
import SizeField from './SizeField';
import { handleFieldErrors, handleGeneralErrors, isNilOrEmpty, maybeCastToNumber } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
}

type CombinedProps =
  & Props
  & WithStyles<ClassNames>;

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClose } = props;
  return (
    <Formik
      validateOnChange={false}
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(values, { resetForm, setSubmitting, setStatus, setErrors }) => {
        const { label, size, region, linodeId, configId } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          region: isNilOrEmpty(region) || region === 'none' ? undefined : region,
          linode_id: maybeCastToNumber(linodeId),
          config_id: maybeCastToNumber(configId),
        })
          .then(response => {
            resetForm(initialValues);
            setStatus({ success: `Volume scheduled for creation.` });
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
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes in size and costs
              $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.
            </Typography>

            <LabelField
              handleChange={handleChange}
              handleBlur={handleBlur}
              error={errors.label}
              value={values.label}
            />

            <SizeField handleChange={handleChange} handleBlur={handleBlur} error={errors.size} value={values.size} />

            <RegionSelect
              error={errors.region}
              handleChange={handleChange}
              name="region"
              onBlur={handleBlur}
              value={values.region}
            />

            <LinodeSelect
              error={errors.linodeId}
              handleChange={(id: number) => setFieldValue('linodeId', id)}
              name="linodeId"
              onBlur={handleBlur}
              region={values.region}
            />

            <ConfigSelect
              error={errors.configId}
              handleChange={(id: string) => setFieldValue('configId', id)}
              linodeId={values.linodeId}
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

