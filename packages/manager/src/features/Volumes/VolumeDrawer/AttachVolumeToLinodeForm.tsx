import { Formik } from 'formik';
import { Grant } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Form from 'src/components/core/Form';
import { resetEventsPolling } from 'src/eventsPolling';
import { openForCreating } from 'src/store/volumeForm';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { number, object } from 'yup';
import ConfigSelect from './ConfigSelect';
import { modes } from './modes';
import { ModeSelection } from './ModeSelection';
import NoticePanel from './NoticePanel';
import Notice from 'src/components/Notice';
import VolumesActionsPanel from './VolumesActionsPanel';
import VolumeSelect from './VolumeSelect';
import { useAttachVolumeMutation } from 'src/queries/volumes';
import { useGrants } from 'src/queries/profile';

interface Props {
  onClose: () => void;
  linodeId: number;
  linodeRegion: string;
  linodeLabel: string;
  readOnly?: boolean;
}

type CombinedProps = Props & DispatchProps;

/**
 * I had to provide a separate validation schema since the linode_id (which is required by API) is
 * provided as a prop and not a user input value.
 */
const AttachVolumeValidationSchema = object({
  volume_id: number()
    .min(0, 'Volume is required.')
    .required('Volume is required.'),
  config_id: number()
    .min(0, 'Config is required.')
    .required('Config is required.'),
});

const initialValues = { volume_id: -1, config_id: -1 };

const AttachVolumeToLinodeForm: React.FC<CombinedProps> = (props) => {
  const { actions, onClose, linodeId, linodeRegion, readOnly } = props;

  const { data: grants } = useGrants();

  const linodeGrants = grants?.linode ?? [];

  const linodeGrant = linodeGrants.filter(
    (grant: Grant) => grant.id === linodeId
  )[0];

  const disabled =
    readOnly || (linodeGrant && linodeGrant.permissions !== 'read_write');

  const { mutateAsync: attachVolume } = useAttachVolumeMutation();

  return (
    <Formik
      validationSchema={AttachVolumeValidationSchema}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        attachVolume({
          volumeId: values.volume_id,
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

const connected = connect(undefined, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(connected);

export default enhanced(AttachVolumeToLinodeForm);
