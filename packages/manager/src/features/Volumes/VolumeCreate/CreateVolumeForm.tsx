import { Form, Formik } from 'formik';
import { Region } from 'linode-js-sdk/lib/regions';
import { APIError } from 'linode-js-sdk/lib/types';
import { CreateVolumeSchema } from 'linode-js-sdk/lib/volumes';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TagsInput, { Tag } from 'src/components/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { MapState } from 'src/store/types';
import { Origin as VolumeDrawerOrigin } from 'src/store/volumeForm';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { sendCreateVolumeEvent } from 'src/utilities/ga';
import isNilOrEmpty from 'src/utilities/isNilOrEmpty';
import maybeCastToNumber from 'src/utilities/maybeCastToNumber';
import ConfigSelect from '../VolumeDrawer/ConfigSelect';
import LabelField from '../VolumeDrawer/LabelField';
import LinodeSelect from '../VolumeDrawer/LinodeSelect';
import NoticePanel from '../VolumeDrawer/NoticePanel';
import PricePanel from '../VolumeDrawer/PricePanel';
import SizeField from '../VolumeDrawer/SizeField';
import VolumesActionsPanel from '../VolumeDrawer/VolumesActionsPanel';

import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import { dcDisplayNames } from 'src/constants';

type ClassNames = 'copy';

const styles = (theme: Theme) =>
  createStyles({
    copy: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  // onClose: () => void;
  regions: Region[];
  onSuccess: (
    volumeLabel: string,
    volumePath: string,
    message?: string
  ) => void;
}

type CombinedProps = Props &
  VolumesRequests &
  WithStyles<ClassNames> &
  StateProps;

const CreateVolumeForm: React.StatelessComponent<CombinedProps> = props => {
  const { onSuccess, classes, createVolume, disabled, origin } = props;
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        const { label, size, region, linodeId, configId, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          region:
            isNilOrEmpty(region) || region === 'none' ? undefined : region,
          linode_id: linodeId === -1 ? undefined : linodeId,
          config_id: configId === -1 ? undefined : configId,
          tags: tags.map(v => v.value)
        })
          .then(({ filesystem_path, label: volumeLabel }) => {
            resetForm(initialValues);
            setStatus({ success: `Volume scheduled for creation.` });
            setSubmitting(false);
            onSuccess(
              volumeLabel,
              filesystem_path,
              `Volume scheduled for creation.`
            );
            // GA Event
            sendCreateVolumeEvent(`${label}: ${size}GiB`, origin);
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
          values,
          touched
        } = formikProps;

        const linodeError =
          values.configId === -9999
            ? 'This Linode has no valid configurations.'
            : touched.linodeId
            ? errors.linodeId
            : undefined;

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
                text={
                  "You don't have permissions to create a new Volume. Please contact an account administrator for details."
                }
                error={true}
                important
              />
            )}
            <Typography variant="body1" data-qa-volume-size-help>
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gibibytes
              in size and costs $0.10/GiB per month. Up to eight volumes can be
              attached to a single Linode.
            </Typography>

            <Typography
              variant="body1"
              className={classes.copy}
              data-qa-volume-help
            >
              Volumes must be created in a particular region. You can choose to
              create a volume in a region and attach it later to a Linode in the
              same region. If you select a Linode from the field below, the
              Volume will be automatically created in that Linode’s region and
              attached upon creation.
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

            <RegionSelect
              errorText={touched.region ? errors.region : undefined}
              regions={props.regions
                .filter(eachRegion =>
                  eachRegion.capabilities.some(eachCape =>
                    eachCape.match(/block/i)
                  )
                )
                .map(eachRegion => ({
                  ...eachRegion,
                  display: dcDisplayNames[eachRegion.id]
                }))}
              name="region"
              onBlur={handleBlur}
              selectedID={values.region}
              handleSelection={value => setFieldValue('region', value)}
              disabled={disabled}
              styles={{
                /** altering styles for mobile-view */
                menuList: (base: any) => ({
                  ...base,
                  maxHeight: `250px !important`
                })
              }}
            />

            <FormHelperText data-qa-volume-region>
              The datacenter where the new volume should be created. Only
              regions supporting block storage are displayed.
            </FormHelperText>

            <LinodeSelect
              error={linodeError}
              name="linodeId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('linodeId', id)}
              region={values.region}
              shouldOnlyDisplayRegionsWithBlockStorage={true}
              disabled={disabled}
            />

            <TagsInput
              tagError={
                touched.tags
                  ? errors.tags
                    ? getErrorStringOrDefault(
                        errors.tags as APIError[],
                        'Unable to tag Volume.'
                      )
                    : undefined
                  : undefined
              }
              name="tags"
              label="Tags"
              disabled={disabled}
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
              disabled={disabled}
            />

            <PricePanel value={values.size} currentSize={10} />

            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              disabled={values.configId === -9999 || disabled}
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
              }}
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

interface StateProps {
  disabled: boolean;
  origin?: VolumeDrawerOrigin;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
  disabled: isRestrictedUser(state) && !hasGrant(state, 'add_volumes'),
  origin: state.volumeDrawer.origin
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumesRequests,
  connected
)(CreateVolumeForm);

export default enhanced;
