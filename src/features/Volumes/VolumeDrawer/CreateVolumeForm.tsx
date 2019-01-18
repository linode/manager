import { Form, Formik } from 'formik';
import * as React from 'react';
import { compose } from 'recompose';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, { VolumesRequests } from 'src/containers/volumesRequests.container';
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

type ClassNames = 'copy';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  copy: {
    marginTop: theme.spacing.unit,
  },
});

interface Props {
  onClose: () => void;
  onSuccess: (volumeLabel: string, volumePath: string, message?: string) => void;
}

type CombinedProps =
  & Props
  & VolumesRequests
  & WithStyles<ClassNames>;

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClose, onSuccess, classes, createVolume } = props;
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
          .then(({filesystem_path, label: volumeLabel }) => {
            resetForm(initialValues);
            setStatus({ success: `Volume scheduled for creation.` });
            setSubmitting(false);
            onSuccess(volumeLabel, filesystem_path, `Volume scheduled for creation.`);
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

            <Typography variant="body1" data-qa-volume-size-help>
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes in size and costs
              $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.
            </Typography>

            <Typography variant="body1" className={classes.copy} data-qa-volume-help>
              Volumes must be created in a particular region. You can choose to create a volume in
              a region and attach it later to a Linode in the same region. If you select a Linode
              from the field below, the Volume will be automatically created in that Linode’s
              region and attached upon creation.
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumesRequests
)(CreateVolumeForm);

export default enhanced;
