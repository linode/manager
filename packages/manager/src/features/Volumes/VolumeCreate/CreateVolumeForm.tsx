import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Region } from '@linode/api-v4/lib/regions/types';
import { CreateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Formik } from 'formik';
import * as React from 'react';
import { connect, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Form from 'src/components/core/Form';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import { dcDisplayNames, MAX_VOLUME_SIZE } from 'src/constants';
import withVolumesRequests, {
  VolumesRequests,
} from 'src/containers/volumesRequests.container';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { hasGrant } from 'src/features/Profile/permissionsHelpers';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useGrants, useProfile } from 'src/queries/profile';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import { Origin as VolumeDrawerOrigin } from 'src/store/volumeForm';
import { isEURegion } from 'src/utilities/formatRegion';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { sendCreateVolumeEvent } from 'src/utilities/ga';
import isNilOrEmpty from 'src/utilities/isNilOrEmpty';
import maybeCastToNumber from 'src/utilities/maybeCastToNumber';
import ConfigSelect, {
  initialValueDefaultId,
} from '../VolumeDrawer/ConfigSelect';
import LabelField from '../VolumeDrawer/LabelField';
import NoticePanel from '../VolumeDrawer/NoticePanel';
import SizeField from '../VolumeDrawer/SizeField';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginBottom: theme.spacing(),
    maxWidth: 680,
  },
  notice: {
    borderColor: theme.color.green,
    fontSize: 15,
    lineHeight: '18px',
  },
  select: {
    width: 320,
  },
  helpIcon: {
    marginBottom: 6,
    marginLeft: theme.spacing(),
    padding: 0,
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 320,
    },
  },
  labelTooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 220,
    },
  },
  size: {
    width: 160,
  },
  linodeConfigSelectWrapper: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  linodeSelect: {
    marginRight: theme.spacing(4),
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-end',
    },
  },
  agreement: {
    maxWidth: '70%',
    [theme.breakpoints.down('xs')]: {
      maxWidth: 'unset',
    },
  },
  button: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
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
  const { onSuccess, createVolume, origin, history, regions } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const [linodeId, setLinodeId] = React.useState<number>(initialValueDefaultId);

  const { data: accountAgreements } = useAccountAgreements();
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState(false);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  // This is to keep track of this linodeId's errors so we can select it from the Redux store for the error message.
  const { error: configsError } = useSelector((state: ApplicationState) => {
    return state.__resources.linodeConfigs[linodeId] ?? { error: {} };
  });

  const configErrorMessage = configsError?.read
    ? 'Unable to load configs for this Linode.' // More specific than the API error message
    : undefined;

  const regionsWithBlockStorage = regions
    .filter((thisRegion) => thisRegion.capabilities.includes('Block Storage'))
    .map((thisRegion) => thisRegion.id);

  const doesNotHavePermission =
    profile?.restricted && !hasGrant('add_volumes', grants);

  const renderSelectTooltip = (tooltipText: string) => {
    return (
      <HelpIcon
        classes={{ popper: classes.tooltip }}
        className={classes.helpIcon}
        text={tooltipText}
        tooltipPosition="right"
      />
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateVolumeSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        const { label, size, region, linode_id, config_id } = values;

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
              /* -- Clanode Change -- */
              //: maybeCastToNumber(linode_id),
              : linode_id,
              /* -- Clanode Change End -- */
          config_id:
            config_id === initialValueDefaultId
              ? undefined
              : maybeCastToNumber(config_id),
        })
          .then(({ filesystem_path, label: volumeLabel }) => {
            if (hasSignedAgreement) {
              updateAccountAgreements({
                eu_model: true,
                privacy_policy: true,
              }).catch(reportAgreementSigningError);
            }

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
            sendCreateVolumeEvent(`${label}: ${size}GB`, origin);
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
        const { linode_id, config_id } = values;

        const linodeError = touched.linode_id ? errors.linode_id : undefined;

        const generalError = status
          ? status.generalError
          : config_id === initialValueDefaultId
          ? errors.config_id
          : undefined;

        const showAgreement =
          isEURegion(values.region) &&
          !profile?.restricted &&
          accountAgreements?.eu_model === false;

        const disabled = Boolean(
          doesNotHavePermission || (showAgreement && !hasSignedAgreement)
        );

        const handleLinodeChange = (linode: Linode | null) => {
          if (linode !== null) {
            setFieldValue('linode_id', linode.id);
            setFieldValue('region', linode.region);
            setLinodeId(linode.id);
          } else {
            // If the LinodeSelect is cleared, reset the values for Region and Config
            setFieldValue('linode_id', initialValueDefaultId);
            setLinodeId(initialValueDefaultId);
          }
        };

        return (
          <Form>
            {generalError ? <NoticePanel error={generalError} /> : null}
            {status ? <NoticePanel success={status.success} /> : null}
            {doesNotHavePermission ? (
              <Notice
                text={
                  "You don't have permissions to create a new Volume. Please contact an account administrator for details."
                }
                error={true}
                important
              />
            ) : null}
            <Box display="flex" flexDirection="column">
              <Paper>
                <Typography
                  className={classes.copy}
                  variant="body1"
                  data-qa-volume-size-help
                >
                  A single Volume can range from 10 to {MAX_VOLUME_SIZE} GB in
                  size and costs $0.10/GB per month. <br />
                  Up to eight volumes can be attached to a single Linode.
                </Typography>
                <LabelField
                  name="label"
                  disabled={doesNotHavePermission}
                  error={touched.label ? errors.label : undefined}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  textFieldStyles={classes.select}
                  tooltipClasses={classes.labelTooltip}
                  tooltipPosition="right"
                  tooltipText="Use only ASCII letters, numbers,
                  underscores, and dashes."
                  value={values.label}
                />
                <Box display="flex" alignItems="flex-end">
                  <SizeField
                    name="size"
                    disabled={doesNotHavePermission}
                    error={touched.size ? errors.size : undefined}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.size}
                    textFieldStyles={classes.size}
                  />
                </Box>
                <Box display="flex" alignItems="flex-end">
                  <RegionSelect
                    label="Region"
                    name="region"
                    disabled={doesNotHavePermission}
                    errorText={touched.region ? errors.region : undefined}
                    handleSelection={(value) => {
                      setFieldValue('region', value);
                      setFieldValue('linode_id', initialValueDefaultId);
                    }}
                    isClearable
                    onBlur={handleBlur}
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
                    selectedID={values.region}
                    width={320}
                  />
                  {renderSelectTooltip(
                    'Volumes must be created in a region. You can choose to create a Volume in a region and attach it later to a Linode in the same region.'
                  )}
                </Box>
                <Box
                  display="flex"
                  alignItems="flex-end"
                  className={classes.linodeConfigSelectWrapper}
                >
                  <Box
                    display="flex"
                    alignItems="flex-end"
                    className={classes.linodeSelect}
                  >
                    <LinodeSelect
                      label="Linode"
                      name="linodeId"
                      disabled={doesNotHavePermission}
                      filterCondition={(linode: Linode) =>
                        regionsWithBlockStorage.includes(linode.region)
                      }
                      handleChange={handleLinodeChange}
                      linodeError={linodeError || configErrorMessage}
                      onBlur={handleBlur}
                      selectedLinode={values.linode_id}
                      region={values.region}
                      isClearable
                      width={320}
                    />
                    {renderSelectTooltip(
                      'If you select a Linode, the Volume will be automatically created in that Linode’s region and attached upon creation.'
                    )}
                  </Box>
                  <ConfigSelect
                    name="configId"
                    disabled={doesNotHavePermission}
                    error={touched.config_id ? errors.config_id : undefined}
                    linodeId={linode_id}
                    onBlur={handleBlur}
                    onChange={(id: number) => setFieldValue('config_id', id)}
                    value={config_id}
                    width={320}
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent={showAgreement ? 'space-between' : 'flex-end'}
                  alignItems="center"
                  flexWrap="wrap"
                  className={classes.buttonGroup}
                >
                  {showAgreement ? (
                    <EUAgreementCheckbox
                      checked={hasSignedAgreement}
                      onChange={(e) => setHasSignedAgreement(e.target.checked)}
                      className={classes.agreement}
                      centerCheckbox
                    />
                  ) : null}
                </Box>
              </Paper>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  buttonType="primary"
                  className={classes.button}
                  disabled={disabled}
                  loading={isSubmitting}
                  onClick={() => handleSubmit()}
                  style={{ marginLeft: 12 }}
                  data-qa-deploy-linode
                >
                  Create Volume
                </Button>
              </Box>
            </Box>
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
}

const initialValues: FormState = {
  label: '',
  size: 20,
  region: '',
  linode_id: initialValueDefaultId,
  config_id: initialValueDefaultId,
};

interface StateProps {
  origin?: VolumeDrawerOrigin;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => ({
  origin: state.volumeDrawer.origin,
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  withVolumesRequests,
  connected
)(CreateVolumeForm);

export default enhanced;
