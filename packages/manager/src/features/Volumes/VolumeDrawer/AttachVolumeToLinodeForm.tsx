import { Grant } from '@linode/api-v4/lib/account';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose } from 'recompose';
import { number, object } from 'yup';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import { useGrants } from 'src/queries/profile';
import { useAttachVolumeMutation } from 'src/queries/volumes';
import { openForCreating } from 'src/store/volumeForm';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { ConfigSelect } from './ConfigSelect';
import { ModeSelection } from './ModeSelection';
import NoticePanel from './NoticePanel';
import VolumeSelect from './VolumeSelect';
import { modes } from './modes';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  onClose: () => void;
  readOnly?: boolean;
}

type CombinedProps = Props & DispatchProps;

/**
 * I had to provide a separate validation schema since the linode_id (which is required by API) is
 * provided as a prop and not a user input value.
 */
const AttachVolumeValidationSchema = object({
  config_id: number()
    .min(0, 'Config is required.')
    .required('Config is required.'),
  volume_id: number()
    .min(0, 'Volume is required.')
    .required('Volume is required.'),
});

const initialValues = { config_id: -1, volume_id: -1 };

const AttachVolumeToLinodeForm: React.FC<CombinedProps> = (props) => {
  const { actions, linodeId, linodeRegion, onClose, readOnly } = props;

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
      onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
        attachVolume({
          config_id: values.config_id,
          linode_id: linodeId,
          volumeId: values.volume_id,
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
      validationSchema={AttachVolumeValidationSchema}
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
                error={status.generalError}
                success={status.success}
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
              disabled={disabled}
              error={touched.volume_id ? errors.volume_id : undefined}
              onBlur={handleBlur}
              onChange={(v) => setFieldValue('volume_id', v)}
              region={linodeRegion}
              value={values.volume_id}
            />

            <ConfigSelect
              disabled={disabled}
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linodeId}
              name="config_id"
              onBlur={handleBlur}
              onChange={(id) => setFieldValue('config_id', id)}
              value={values.config_id}
            />
            <ActionsPanel
              primaryButtonProps={
                handleSubmit
                  ? {
                      'data-testid': 'submit',
                      disabled,
                      label: 'Attach Volume',
                      loading: isSubmitting,
                      onClick: () => handleSubmit(),
                    }
                  : undefined
              }
              secondaryButtonProps={
                onClose
                  ? {
                      'data-testid': 'cancel',
                      label: 'Cancel',
                      onClick: () => {
                        resetForm();
                        onClose();
                      },
                    }
                  : undefined
              }
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
