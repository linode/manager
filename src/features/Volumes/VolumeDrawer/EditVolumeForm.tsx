import { Form, Formik } from 'formik';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TagsInput, { Tag } from 'src/components/TagsInput';
import withVolumesRequest, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { updateVolumes$ } from 'src/features/Volumes/WithEvents';
import { UpdateVolumeSchema } from 'src/services/volumes/volumes.schema';
import { MapState } from 'src/store/types';
import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  onClose: () => void;
  volumeLabel: string;
  volumeTags: Tag[];
  volumeId: number;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  VolumesRequests &
  StateProps;

/** Single field posts like rename/resize dont have validation schemas in services */
const validationSchema = UpdateVolumeSchema;
interface FormState {
  label: string;
  tags: Tag[];
}

const RenameVolumeForm: React.StatelessComponent<CombinedProps> = props => {
  const {
    volumeId,
    volumeLabel,
    volumeTags,
    onClose,
    updateVolume,
    disabled
  } = props;
  const initialValues: FormState = { label: volumeLabel, tags: volumeTags };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        const { label, tags } = values;

        setSubmitting(true);

        updateVolume({
          volumeId,
          label,
          tags: tags.map(v => v.value)
        })
          .then(response => {
            resetForm();
            updateVolumes$.next(true);
            onClose();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to rename this volume at this time. Please try again later.`;
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
      initialValues={initialValues}
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
        return (
          <Form>
            {status && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}
            {disabled && (
              <Notice
                text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
                error={true}
                important
              />
            )}

            <LabelField
              error={errors.label}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
              disabled={disabled}
            />

            <TagsInput
              tagError={
                touched.tags
                  ? errors.tags
                    ? 'Unable to tag volume.'
                    : undefined
                  : undefined
              }
              name="tags"
              label="Tags"
              onChange={selected => setFieldValue('tags', selected)}
              value={values.tags}
              disabled={disabled}
            />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              disabled={disabled}
              onCancel={() => {
                resetForm();
                onClose();
              }}
            />
          </Form>
        );
      }}
    />
  );
};

const styled = withStyles(styles);

interface StateProps {
  disabled: boolean;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => {
  const volumesPermissions = pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'volume'],
    state
  );
  const volumePermissions = volumesPermissions.find(
    (v: Linode.Grant) => (v.id = ownProps.volumeId)
  );
  return {
    disabled:
      isRestrictedUser(state) &&
      volumePermissions &&
      volumePermissions.permissions === 'read_only'
  };
};

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumesRequest,
  connected
)(RenameVolumeForm);

export default enhanced;
