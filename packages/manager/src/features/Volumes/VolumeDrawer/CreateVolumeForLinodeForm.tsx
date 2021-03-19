/**
 * @todo Display the volume configuration information on success.
 */
import { Formik } from 'formik';
import { APIError } from '@linode/api-v4/lib/types';
import { CreateVolumeSchema } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Form from 'src/components/core/Form';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, {
  VolumesRequests,
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  hasGrant,
  isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import { MapState } from 'src/store/types';
import {
  openForAttaching,
  Origin as VolumeDrawerOrigin,
} from 'src/store/volumeForm';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { sendCreateVolumeEvent } from 'src/utilities/ga';
import maybeCastToNumber from 'src/utilities/maybeCastToNumber';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import { modes } from './modes';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import PricePanel from './PricePanel';
import SizeField from './SizeField';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root' | 'textWrapper';
const styles = (theme: Theme) =>
  createStyles({
    root: {},
    textWrapper: {
      marginBottom: theme.spacing(1) + 2,
    },
  });

interface Props {
  onClose: () => void;
  linode_id: number;
  linodeLabel: string;
  linodeRegion: string;
  onSuccess: (
    volumeLabel: string,
    volumePath: string,
    message?: string
  ) => void;
}

type CombinedProps = Props &
  StateProps &
  VolumesRequests &
  DispatchProps &
  WithStyles<ClassNames>;

const CreateVolumeForm: React.FC<CombinedProps> = (props) => {
  const {
    onClose,
    onSuccess,
    linode_id,
    linodeLabel,
    linodeRegion,
    actions,
    createVolume,
    disabled,
    origin,
  } = props;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        const { label, size, config_id, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          linode_id: maybeCastToNumber(linode_id),
          config_id:
            // If the config_id still set to default value of -1, set this to undefined, so volume gets created on back-end according to the API logic
            config_id === -1 ? undefined : maybeCastToNumber(config_id),
          tags: tags.map((v) => v.value),
        })
          .then(({ label: newLabel, filesystem_path }) => {
            resetEventsPolling();
            onSuccess(
              newLabel,
              filesystem_path,
              `Volume scheduled for creation.`
            );
            // GA Event
            sendCreateVolumeEvent(`${label}: ${size}GiB`, origin);
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to create a volume at this time. Please try again later.`;
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
    >
      {({
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
      }) => {
        /**
         * This form doesn't have a region select (the region is auto-populated)
         * so if the API returns an error with field === 'region' the field mapping
         * logic will pass over it. Explicitly use general error Notice in this case.
         * If configs are not available, set the general error Notice to the config_id error (so that the error still shows in the UI instead of creation failing silently).
         */

        const { config_id } = values;

        const generalError = status
          ? status.generalError
          : config_id === -1
          ? errors.config_id
          : errors.region;

        return (
          <Form>
            {generalError && <NoticePanel error={generalError} />}
            {status && <NoticePanel success={status.success} />}
            {disabled && (
              <NoticePanel
                error={
                  "You don't have permissions to create a new Volume. Please contact an account administrator for details."
                }
                important
              />
            )}
            <ModeSelection
              mode={modes.CREATING_FOR_LINODE}
              onChange={() => {
                actions.switchToAttaching();
              }}
            />

            <Typography
              variant="body1"
              className={props.classes.textWrapper}
              data-qa-volume-attach-help
              style={{ marginTop: 24 }}
            >
              {`This volume will be immediately scheduled for attachment to ${linodeLabel} and available to other Linodes in the ${linodeRegion} data-center.`}
            </Typography>

            <Typography
              variant="body1"
              className={props.classes.textWrapper}
              data-qa-volume-size-help
            >
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes
              in size and costs $0.10/GiB per month. Up to eight volumes can be
              attached to a single Linode.
            </Typography>

            <LabelField
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
              disabled={disabled}
            />

            <SizeField
              error={touched.size ? errors.size : undefined}
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.size}
              disabled={disabled}
            />

            <ConfigSelect
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linode_id}
              name="configId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('config_id', id)}
              value={values.config_id}
              disabled={disabled}
            />

            <TagsInput
              tagError={
                touched.tags
                  ? errors.tags
                    ? getErrorStringOrDefault(
                        errors.tags as APIError[],
                        'Unable to tag volume.'
                      )
                    : undefined
                  : undefined
              }
              name="tags"
              label="Tags"
              onChange={(selected) => setFieldValue('tags', selected)}
              value={values.tags}
              disabled={disabled}
            />

            <PricePanel value={values.size} currentSize={10} />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
              disabled={disabled}
              submitText="Create Volume"
            />
          </Form>
        );
      }}
    </Formik>
  );
};
interface FormState {
  label: string;
  size: number;
  region: string;
  linode_id: number;
  config_id: number;
  tags: Tag[];
}

const initialValues: FormState = {
  label: '',
  size: 20,
  region: 'none',
  linode_id: -1,
  config_id: -1,
  tags: [],
};

const styled = withStyles(styles);

interface DispatchProps {
  actions: {
    switchToAttaching: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch,
  ownProps
) => ({
  actions: {
    switchToAttaching: () =>
      dispatch(
        openForAttaching(
          ownProps.linode_id,
          ownProps.linodeRegion,
          ownProps.linodeLabel
        )
      ),
  },
});

interface StateProps {
  disabled: boolean;
  origin?: VolumeDrawerOrigin;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => ({
  // disabled if the profile is restricted and doesn't have add_volumes grant
  disabled: isRestrictedUser(state) && !hasGrant(state, 'add_volumes'),
  origin: state.volumeDrawer.origin,
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withVolumesRequests
)(CreateVolumeForm);

export default enhanced;
