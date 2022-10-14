import { Formik } from 'formik';
import { Grant } from '@linode/api-v4/lib/account';
import { attachVolume } from '@linode/api-v4/lib/volumes';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Form from 'src/components/core/Form';
import withVolumesRequests, {
  VolumesRequests,
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/eventsPolling';
import { MapState } from 'src/store/types';
import { openForCreating } from 'src/store/volumeForm';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { number, object } from 'yup';
import ConfigSelect from './ConfigSelect';
import { modes } from './modes';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import Notice from 'src/components/Notice';
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
  config_id: number().required(),
});

const initialValues = { volume_id: -1, config_id: -1 };

const AttachVolumeToLinodeForm: React.FC<CombinedProps> = (props) => {
  const {
    actions,
    onClose,
    linodeId,
    linodeRegion,
    linodeGrants,
    readOnly,
  } = props;
  const linodeGrant = linodeGrants.filter(
    (grant: Grant) => grant.id === linodeId
  )[0];
  const disabled =
    readOnly || (linodeGrant && linodeGrant.permissions !== 'read_write');
  return (
    <Formik
      validationSchema={validationScheme}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        attachVolume(values.volume_id, {
          linode_id: linodeId,
          config_id: values.config_id,
        })
          .then((_) => {
            onClose();
            resetEventsPolling();
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to attach this volume at this time. Please try again later.`;
            const mapErrorToStatus = () =>
              setStatus({ generalError: getErrorMap([], errorResponse).none });

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
    >
      {({
        errors,
        handleBlur,
        handleSubmit,
        isSubmitting,
        resetForm,
        setFieldValue,
        status,
        touched,
        values,
      }) => {
        return (
          <Form>
            {status && !disabled && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}

            {disabled && (
              <Notice
                text={
                  "You don't have permissions to add a Volume for this Linode. Please contact an account administrator for details."
                }
                error={true}
                important
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
              onChange={(v) => setFieldValue('volume_id', v)}
              region={linodeRegion}
              disabled={disabled}
            />

            <ConfigSelect
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linodeId}
              name="config_id"
              onBlur={handleBlur}
              onChange={(id) => setFieldValue('config_id', id)}
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
              submitText="Attach Volume"
            />
          </Form>
        );
      }}
    </Formik>
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
        openForCreating('Created from Linode Details', {
          linodeId: ownProps.linodeId,
          linodeLabel: ownProps.linodeLabel,
          linodeRegion: ownProps.linodeRegion,
        })
      ),
  },
});

interface StateProps {
  linodeGrants: Grant[];
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => ({
  linodeGrants: pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'linode'],
    state
  ),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(connected, withVolumesRequests);

export default enhanced(AttachVolumeToLinodeForm);
