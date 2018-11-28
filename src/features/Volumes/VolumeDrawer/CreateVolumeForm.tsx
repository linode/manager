import { Form, Formik } from 'formik';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { createVolume } from 'src/services/volumes';
import { CreateVolumeSchema } from 'src/services/volumes/volumes.schema.ts';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import LinodeSelect from './LinodeSelect';
import NoticePanel from './NoticePanel';
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
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(values, { resetForm, setSubmitting, setStatus, setErrors }) => {
        const { label, size, region, linodeId, configId, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          region: isNilOrEmpty(region) || region === 'none' ? undefined : region,
          linode_id: linodeId === -1 ? undefined : linodeId,
          config_id: configId === -1 ? undefined : configId,
          tags: tags.map(v => v.value),
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
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldValue,
          status,
          values,
          touched,
        } = formikProps;

        const linodeError = values.configId === -9999
          ? 'This Linode has no valid configurations.'
          : touched.linodeId
            ? errors.linodeId
            : undefined

        return (
          <Form>

            {status && <NoticePanel success={status.success} error={status.generalError} />}

            <Typography variant="body1">
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes in size and costs
              $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.
            </Typography>

            <LabelField
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />

            <SizeField
              error={touched.size ? errors.size : undefined}
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.size}
            />

            <RegionSelect
              error={touched.region ? errors.region : undefined}
              name="region"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.region}
            />

            <LinodeSelect
              error={linodeError}
              name="linodeId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('linodeId', id)}
              region={values.region}
            />

            <TagsInput
              tagError={touched.tags ? errors.tags ? 'Unable to tag volume.' : undefined : undefined}
              name="tags"
              label="Tags"
              onBlur={handleBlur}
              onChange={selected => setFieldValue('tags', selected)}
              value={values.tags}
            />

            <ConfigSelect
              error={touched.configId ? errors.configId : undefined}
              linodeId={values.linodeId}
              name="configId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('configId', id)}
              value={values.configId}
            />

            <PricePanel value={values.size} currentSize={10} />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              disabled={values.configId === -9999}
              onSubmit={handleSubmit}
              onCancel={() => { resetForm(); onClose(); }}
            />
          </Form>
        )
      }} />
  );
};
interface FormState {
  label: string;
  size: number;
  region: string;
  linodeId: number;
  configId: number;
  tags: Tag[];
}

const initialValues: FormState = {
  label: '',
  size: 20,
  region: 'none',
  linodeId: -1,
  configId: -1,
  tags: [],
};

const styled = withStyles(styles);

export default styled(CreateVolumeForm);

