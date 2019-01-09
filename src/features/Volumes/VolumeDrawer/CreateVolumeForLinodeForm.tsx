/**
 * @todo Display the volume configuration information on success.
 */
import { Form, Formik } from 'formik';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { resetEventsPolling } from 'src/events';
import { createVolume } from 'src/services/volumes';
import { CreateVolumeSchema } from 'src/services/volumes/volumes.schema.ts';
import { openForAttaching } from 'src/store/reducers/volumeDrawer';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import PricePanel from './PricePanel';
import SizeField from './SizeField';
import { handleFieldErrors, handleGeneralErrors, maybeCastToNumber } from './utils';
import { modes } from './VolumeDrawer';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root' | 'textWrapper';
const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  textWrapper: {
    marginBottom: 10,
  }
});

interface Props {
  onClose: () => void;
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  onSuccess: (volumeLabel: string, volumePath: string, message?: string) => void;
}

type CombinedProps =
  & Props
  & DispatchProps
  & WithStyles<ClassNames>;

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClose, onSuccess, linodeId, linodeLabel, linodeRegion, actions, } = props;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        const { label, size, configId, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          linode_id: maybeCastToNumber(linodeId),
          config_id: maybeCastToNumber(configId),
          tags: tags.map(v => v.value),
        })
          .then(({ label: newLabel, filesystem_path }) => {
            resetEventsPolling();
            onSuccess(newLabel, filesystem_path, `Volume scheduled for creation.`);
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
          touched,
          values,
        } = formikProps;

        return (
          <Form>
            {status && <NoticePanel success={status.success} error={status.generalError} />}

            <ModeSelection mode={modes.CREATING_FOR_LINODE} onChange={() => { actions.switchToAttaching() }} />

            <Typography variant="body1" className={props.classes.textWrapper} data-qa-volume-attach-help style={{ marginTop: 24 }}>
              {`This volume will be immediately scheduled for attachment to ${linodeLabel} and available to other Linodes in the ${linodeRegion} data-center.`}
            </Typography>

            <Typography variant="body1" className={props.classes.textWrapper} data-qa-volume-size-help>
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

            <ConfigSelect
              error={touched.configId ? errors.configId : undefined}
              linodeId={linodeId}
              name="configId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('configId', id)}
              value={values.configId}
            />

            <TagsInput
              tagError={touched.tags ? errors.tags ? 'Unable to tag volume.' : undefined : undefined}
              name="tags"
              label="Tags"
              onChange={selected => setFieldValue('tags', selected)}
              value={values.tags}
            />

            <PricePanel value={values.size} currentSize={10} />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
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

interface DispatchProps {
  actions: {
    switchToAttaching: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => ({
  actions: {
    switchToAttaching: () => dispatch(openForAttaching(ownProps.linodeId, ownProps.linodeRegion, ownProps.linodeLabel))
  },
});

const connected = connect(undefined, mapDispatchToProps);

export default styled(connected(CreateVolumeForm));
