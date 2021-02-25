import { Formik } from 'formik';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Region } from '@linode/api-v4/lib/regions/types';
import { APIError } from '@linode/api-v4/lib/types';
import { CreateVolumeSchema } from '@linode/api-v4/lib/volumes';
import { Formik } from 'formik';
import * as React from 'react';
import { connect, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CheckoutBar, { DisplaySectionList } from 'src/components/CheckoutBar';
import Form from 'src/components/core/Form';
import FormHelperText from 'src/components/core/FormHelperText';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Tag from 'src/components/Tag';
import TagsInput, { Tag as _Tag } from 'src/components/TagsInput';
import { dcDisplayNames, MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, {
  VolumesRequests,
} from 'src/containers/volumesRequests.container';
import {
  hasGrant,
  isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import { Origin as VolumeDrawerOrigin } from 'src/store/volumeForm';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { sendCreateVolumeEvent } from 'src/utilities/ga';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import isNilOrEmpty from 'src/utilities/isNilOrEmpty';
import maybeCastToNumber from 'src/utilities/maybeCastToNumber';
import ConfigSelect, {
  initialValueDefaultId,
} from '../VolumeDrawer/ConfigSelect';
import LabelField from '../VolumeDrawer/LabelField';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import NoticePanel from '../VolumeDrawer/NoticePanel';
import SizeField from '../VolumeDrawer/SizeField';

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  container: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
  },
  sidebar: {
    [theme.breakpoints.down('sm')]: {
      marginTop: `0 !important`,
    },
    '& > div': {
      [theme.breakpoints.up('md')]: {
        padding: `${theme.spacing(1)}px`,
      },
    },
  },
  copy: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
}));

interface Props {
  regions: Region[];
  history: RouteComponentProps['history'];
  onSuccess: (
    volumeLabel: string,
    volumePath: string,
    message?: string
  ) => void;
}

type CombinedProps = Props & VolumesRequests & StateProps;

const CreateVolumeForm: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { onSuccess, createVolume, disabled, origin, history, regions } = props;

  const [linodeId, setLinodeId] = React.useState<number>(initialValueDefaultId);

  // This is to keep track of this linodeId's errors so we can select it from the Redux store for the error message.
  const { error: configsError } = useSelector((state: ApplicationState) => {
    return state.__resources.linodeConfigs[linodeId] ?? { error: {} };
  });

  const configErrorMessage = configsError?.read
    ? 'Unable to load Configs for this Linode.' // More specific than the API error message
    : undefined;

  const regionsWithBlockStorage = regions
    .filter((thisRegion) => thisRegion.capabilities.includes('Block Storage'))
    .map((thisRegion) => thisRegion.id);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        const { label, size, region, linode_id, config_id, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          label,
          size: maybeCastToNumber(size),
          region:
            isNilOrEmpty(region) || region === 'none' ? undefined : region,
          linode_id:
            linode_id === initialValueDefaultId
              ? undefined
              : maybeCastToNumber(linode_id),
          config_id:
            config_id === initialValueDefaultId
              ? undefined
              : maybeCastToNumber(config_id),
          tags: tags.map((v) => v.value),
        })
          .then(({ filesystem_path, label: volumeLabel }) => {
            resetForm({ values: initialValues });
            setStatus({ success: `Volume scheduled for creation.` });
            setSubmitting(false);
            onSuccess(
              volumeLabel,
              filesystem_path,
              `Volume scheduled for creation.`
            );
            history.push('/volumes');
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
        setFieldValue,
        status,
        values,
        touched,
      }) => {
        const { region, linode_id, tags, config_id } = values;

        const linodeError = touched.linode_id ? errors.linode_id : undefined;

        const generalError = status
          ? status.generalError
          : config_id === initialValueDefaultId
          ? errors.config_id
          : undefined;

        const displaySections = [];
        if (region) {
          displaySections.push({
            title: props.regions
              .filter((c) => c.id === region)
              .map((eachRegion) => eachRegion.country.toUpperCase())
              .join(),
            details: props.regions
              .filter((c) => c.id === region)
              .map((eachRegion) => dcDisplayNames[eachRegion.id])
              .join(),
          });
        }
        if (linode_id !== initialValueDefaultId) {
          const linodeObject: any = getEntityByIDFromStore('linode', linode_id);
          displaySections.push({
            title: 'Attach To',
            details: linodeObject ? linodeObject.label : null,
          });
        }
        if (tags.length !== 0) {
          displaySections.push({
            title: 'Tags',
            details: tags.map((tag, i) => <Tag key={i} label={tag.label} />),
          });
        }

        return (
          <Form className={classes.form}>
            {generalError && <NoticePanel error={generalError} />}
            {status && <NoticePanel success={status.success} />}
            {disabled && (
              <Notice
                text={
                  "You don't have permissions to create a new Volume. Please contact an account administrator for details."
                }
                error={true}
                important
              />
            )}
            <Grid container>
              <Grid item className="mlMain">
                <Paper className={classes.container}>
                  <Typography variant="body1" data-qa-volume-size-help>
                    A single Volume can range from 10 to {MAX_VOLUME_SIZE}{' '}
                    gibibytes in size and costs $0.10/GiB per month. Up to eight
                    volumes can be attached to a single Linode.
                  </Typography>
                  <Typography
                    variant="body1"
                    className={classes.copy}
                    data-qa-volume-help
                  >
                    Volumes must be created in a particular region. You can
                    choose to create a volume in a region and attach it later to
                    a Linode in the same region. If you select a Linode from the
                    field below, the Volume will be automatically created in
                    that Linode’s region and attached upon creation.
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
                    isClearable
                    errorText={touched.region ? errors.region : undefined}
                    regions={props.regions
                      .filter((eachRegion) =>
                        eachRegion.capabilities.some((eachCape) =>
                          eachCape.match(/block/i)
                        )
                      )
                      .map((eachRegion) => ({
                        ...eachRegion,
                        display: dcDisplayNames[eachRegion.id],
                      }))}
                    name="region"
                    onBlur={handleBlur}
                    selectedID={values.region}
                    handleSelection={(value) => {
                      setFieldValue('region', value);
                      setFieldValue('linode_id', initialValueDefaultId);
                    }}
                    disabled={disabled}
                    styles={{
                      /** altering styles for mobile-view */
                      menuList: (base: any) => ({
                        ...base,
                        maxHeight: `250px !important`,
                      }),
                    }}
                  />
                  <FormHelperText data-qa-volume-region>
                    The datacenter where the new volume should be created. Only
                    regions supporting block storage are displayed.
                  </FormHelperText>
                  <LinodeSelect
                    linodeError={linodeError || configErrorMessage}
                    name="linodeId"
                    onBlur={handleBlur}
                    handleChange={(linode: Linode) => {
                      setFieldValue('linode_id', linode.id);
                      setFieldValue('region', linode.region);
                      setLinodeId(linode.id);
                    }}
                    selectedLinode={values.linode_id}
                    region={values.region}
                    filterCondition={(linode: Linode) =>
                      regionsWithBlockStorage.includes(linode.region)
                    }
                    disabled={disabled}
                  />
                  <ConfigSelect
                    error={touched.config_id ? errors.config_id : undefined}
                    linodeId={linode_id}
                    name="configId"
                    onBlur={handleBlur}
                    onChange={(id: number) => setFieldValue('config_id', id)}
                    value={config_id}
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
                    onChange={(selected) => setFieldValue('tags', selected)}
                    value={values.tags}
                    menuPlacement="top"
                  />
                </Paper>
              </Grid>
              <Grid item className={`${classes.sidebar} mlSidebar`}>
                <CheckoutBar
                  heading={`${values.label || 'Volume'} Summary`}
                  onDeploy={handleSubmit}
                  calculatedPrice={values.size / 10}
                  disabled={disabled}
                  isMakingRequest={isSubmitting}
                >
                  <DisplaySectionList displaySections={displaySections} />
                </CheckoutBar>
              </Grid>
            </Grid>
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
  tags: _Tag[];
}

const initialValues: FormState = {
  label: '',
  size: 20,
  region: '',
  linode_id: initialValueDefaultId,
  config_id: initialValueDefaultId,
  tags: [],
};

interface StateProps {
  disabled: boolean;
  origin?: VolumeDrawerOrigin;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => ({
  disabled: isRestrictedUser(state) && !hasGrant(state, 'add_volumes'),
  origin: state.volumeDrawer.origin,
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  withVolumesRequests,
  connected
)(CreateVolumeForm);

export default enhanced;
