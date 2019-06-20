import { Form, Formik } from 'formik';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/events';
import { attachVolume } from 'src/services/volumes';
import { MapState } from 'src/store/types';
import { openForCreating } from 'src/store/volumeDrawer';
import { number, object } from 'yup';
import ConfigSelect from './ConfigSelect';
import { modes } from './modes';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import VolumesActionsPanel from './VolumesActionsPanel';
import VolumeSelect from './VolumeSelect';

interface Props {
  onClose: () => void;
  linodeId: number;
  linodeRegion: string;
  linodeLabel: string;
  readOnly?: boolean;
}

type CombinedProps = Props & StateProps & DispatchProps & VolumesRequests;

/**
 * I had to provide a separate validation schema since the linode_id (which is required by API) is
 * provided as a prop and not a user input value.
 */
const validationScheme = object({
  volume_id: number().required(),
  config_id: number().required()
});

const initialValues = { volume_id: -1, config_id: -1 };

const AttachVolumeToLinodeForm: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    actions,
    onClose,
    linodeId,
    linodeRegion,
    linodeGrants,
    readOnly
  } = props;
  const linodeGrant = linodeGrants.filter(
    (grant: Linode.Grant) => grant.id === linodeId
  )[0];
  const disabled =
    readOnly || (linodeGrant && linodeGrant.permissions !== 'read_write');
  return (
    <Formik
      validationSchema={validationScheme}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        attachVolume(values.volume_id, {
          linode_id: linodeId,
          config_id: values.config_id
        })
          .then(response => {
            onClose();
            resetEventsPolling();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to attach this volume at this time. Please try again later.`;
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
            {status && !disabled && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}

            {disabled && (
              <NoticePanel
                error={
                  "You don't have permissions to add a Volume for this Linode. Please contact an account administrator for details."
                }
              />
            )}

            <ModeSelection
              mode={modes.ATTACHING}
              onChange={actions.switchToCreating}
            />

            <VolumeSelect
              error={touched.volume_id ? errors.volume_id : undefined}
              name="volumd_id"
              value={values.volume_id}
              onBlur={handleBlur}
              onChange={v => setFieldValue('volume_id', v)}
              region={linodeRegion}
              disabled={disabled}
            />

            <ConfigSelect
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linodeId}
              name="config_id"
              onBlur={handleBlur}
              onChange={id => setFieldValue('config_id', id)}
              value={values.config_id}
              disabled={disabled}
            />

            <VolumesActionsPanel
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
              isSubmitting={isSubmitting}
              disabled={disabled}
            />
          </Form>
        );
      }}
    />
  );
};

interface DispatchProps {
  actions: {
    switchToCreating: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch,
  ownProps
) => ({
  actions: {
    switchToCreating: () =>
      dispatch(
        openForCreating(
          ownProps.linodeId,
          ownProps.linodeLabel,
          ownProps.linodeRegion
        )
      )
  }
});

interface StateProps {
  linodeGrants: Linode.Grant[];
}

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
  linodeGrants: pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'linode'],
    state
  )
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, Props>(
  connected,
  withVolumesRequests
);

export default enhanced(AttachVolumeToLinodeForm);
