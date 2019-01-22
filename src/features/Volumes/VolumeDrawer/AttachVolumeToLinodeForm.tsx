import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import withVolumesRequests, { VolumesRequests } from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/events';
import { attachVolume } from 'src/services/volumes';
import { openForCreating } from 'src/store/volumeDrawer';
import { number, object } from 'yup';
import ConfigSelect from './ConfigSelect';
import ModeSelection from './ModeSelection';
import NoticePanel from './NoticePanel';
import { handleFieldErrors, handleGeneralErrors } from './utils';
import { modes } from './VolumeDrawer';
import VolumesActionsPanel from './VolumesActionsPanel';
import VolumeSelect from './VolumeSelect';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  onClose: () => void;
  linodeId: number;
  linodeRegion: string;
  linodeLabel: string;
}

type CombinedProps =
  & Props
  & DispatchProps
  & VolumesRequests
  & WithStyles<ClassNames>;

/**
 * I had to provide a separate validation schema since the linode_id (which is required by API) is
 * provided as a prop and not a user input value.
 */
const validationScheme = object({
  volume_id: number().required(),
  config_id: number().required(),
});

const initialValues = { volume_id: -1, config_id: -1 };

const AttachVolumeToLinodeForm: React.StatelessComponent<CombinedProps> = (props) => {
  const { actions, onClose, linodeId, linodeRegion } = props;
  return (
    <Formik
      validationSchema={validationScheme}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        attachVolume(values.volume_id, { linode_id: linodeId, config_id: values.config_id })
          .then(response => {
            onClose();
            resetEventsPolling();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to attach this volume at this time. Please try again later.`;
            const mapErrorToStatus = (generalError: string) => setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
          })

      }}
      initialValues={initialValues}
      render={(formikProps) => {

        const {
          errors,
          handleBlur,
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

            <ModeSelection mode={modes.ATTACHING} onChange={actions.switchToCreating} />

            <VolumeSelect
              error={touched.volume_id ? errors.volume_id : undefined}
              name="volumd_id"
              value={values.volume_id}
              onBlur={handleBlur}
              onChange={v => setFieldValue('volume_id', v)}
              region={linodeRegion}
            />

            <ConfigSelect
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linodeId}
              name="config_id"
              onBlur={handleBlur}
              onChange={id => setFieldValue('config_id', id)}
              value={values.config_id}
            />

            <VolumesActionsPanel
              onSubmit={handleSubmit}
              onCancel={() => { resetForm(); onClose() }}
              isSubmitting={isSubmitting}
            />
          </Form>
        );
      }}
    />
  );
};

const styled = withStyles(styles);

interface DispatchProps {
  actions: {
    switchToCreating: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => ({
  actions: {
    switchToCreating: () => dispatch(openForCreating(ownProps.linodeId, ownProps.linodeLabel, ownProps.linodeRegion))
  },
});

const connected = connect(undefined, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withVolumesRequests
);

export default enhanced(AttachVolumeToLinodeForm)
