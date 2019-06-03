/**
 * @todo Display the volume configuration information on success.
 */
import { Form, Formik } from 'formik';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/events';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { CreateVolumeSchema } from 'src/services/volumes/volumes.schema.ts';
import { MapState } from 'src/store/types';
import { openForAttaching } from 'src/store/volumeDrawer';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { sendCreateVolumeEvent } from 'src/utilities/ga';
import ConfigSelect from './ConfigSelect';
import LabelField from './LabelField';
import { modes } from './modes';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import PricePanel from './PricePanel';
import SizeField from './SizeField';
import {
  handleFieldErrors,
  handleGeneralErrors,
  maybeCastToNumber
} from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root' | 'textWrapper';
const styles = (theme: Theme) =>
  createStyles({
  root: {},
  textWrapper: {
    marginBottom: theme.spacing(1) + 2
  }
});

interface Props {
  onClose: () => void;
  linodeId: number;
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

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = props => {
  const {
    onClose,
    onSuccess,
    linodeId,
    linodeLabel,
    linodeRegion,
    actions,
    createVolume,
    disabled
  } = props;

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
          tags: tags.map(v => v.value)
        })
          .then(({ label: newLabel, filesystem_path }) => {
            resetEventsPolling();
            onSuccess(
              newLabel,
              filesystem_path,
              `Volume scheduled for creation.`
            );
            // GA Event
            sendCreateVolumeEvent(`${label}: ${size}GiB`);
          })
          .catch(errorResponse => {
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

        /**
         * This form doesn't have a region select (the region is auto-populated)
         * so if the API returns an error with field === 'region' the field mapping
         * logic will pass over it. Explicitly use general error Notice in this case.
         */
        const generalError = status ? status.generalError : errors.region;

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
              error={touched.configId ? errors.configId : undefined}
              linodeId={linodeId}
              name="configId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('configId', id)}
              value={values.configId}
              disabled={disabled}
            />

            <TagsInput
              tagError={
                touched.tags
                  ? errors.tags
                    ? getErrorStringOrDefault(
                        errors.tags,
                        'Unable to tag volume.'
                      )
                    : undefined
                  : undefined
              }
              name="tags"
              label="Tags"
              onChange={selected => setFieldValue('tags', selected)}
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
            />
          </Form>
        );
      }}
    />
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
  tags: []
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
          ownProps.linodeId,
          ownProps.linodeRegion,
          ownProps.linodeLabel
        )
      )
  }
});

interface StateProps {
  disabled: boolean;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
  // disabled if the profile is restricted and doesn't have add_volumes grant
  disabled: isRestrictedUser(state) && !hasGrant(state, 'add_volumes')
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withVolumesRequests
)(CreateVolumeForm);

export default enhanced;
