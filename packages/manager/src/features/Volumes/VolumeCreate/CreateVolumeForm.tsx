import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Region } from '@linode/api-v4/lib/regions/types';
import { CreateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Theme, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
// import { MAX_VOLUME_SIZE } from 'src/constants';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useCreateVolumeMutation } from 'src/queries/volumes';
import { MapState } from 'src/store/types';
import { Origin as VolumeDrawerOrigin } from 'src/store/volumeForm';
import { sendCreateVolumeEvent } from 'src/utilities/analytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';

import { ConfigSelect } from '../VolumeDrawer/ConfigSelect';
import LabelField from '../VolumeDrawer/LabelField';
import NoticePanel from '../VolumeDrawer/NoticePanel';
import SizeField from '../VolumeDrawer/SizeField';

const useStyles = makeStyles((theme: Theme) => ({
  agreement: {
    maxWidth: '70%',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'unset',
    },
  },
  button: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  copy: {
    marginBottom: theme.spacing(),
    maxWidth: 680,
  },
  labelTooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 220,
    },
  },
  linodeConfigSelectWrapper: {
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  linodeSelect: {
    marginRight: theme.spacing(4),
  },
  notice: {
    borderColor: theme.color.green,
    fontSize: 15,
    lineHeight: '18px',
  },
  select: {
    width: 320,
  },
  size: {
    width: 160,
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 320,
    },
  },
}));

interface Props {
  history: RouteComponentProps['history'];
  onSuccess: (
    volumeLabel: string,
    volumePath: string,
    message?: string
  ) => void;
  regions: Region[];
}

type CombinedProps = Props & StateProps;

const CreateVolumeForm: React.FC<CombinedProps> = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const { history, onSuccess, origin } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const { data: regions } = useRegionsQuery();

  const { mutateAsync: createVolume } = useCreateVolumeMutation();

  const { data: accountAgreements } = useAccountAgreements();
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState(false);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const regionsWithBlockStorage =
    regions
      ?.filter((thisRegion) =>
        thisRegion.capabilities.includes('Block Storage')
      )
      .map((thisRegion) => thisRegion.id) ?? [];

  const doesNotHavePermission =
    profile?.restricted && !grants?.global.add_volumes;

  const renderSelectTooltip = (tooltipText: string) => {
    return (
      <TooltipIcon
        sxTooltipIcon={{
          marginBottom: '6px',
          marginLeft: theme.spacing(),
          padding: 0,
        }}
        classes={{ popper: classes.tooltip }}
        status="help"
        text={tooltipText}
        tooltipPosition="right"
      />
    );
  };

  return (
    <Formik
      onSubmit={(
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        const { config_id, label, linode_id, region, size } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          config_id:
            config_id === null ? undefined : maybeCastToNumber(config_id),
          label,
          linode_id:
            linode_id === null ? undefined : maybeCastToNumber(linode_id),
          region:
            isNilOrEmpty(region) || region === 'none' ? undefined : region,
          size: maybeCastToNumber(size),
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
            // Analytics Event
            sendCreateVolumeEvent(`Size: ${size}GB`, origin);
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to create a volume at this time. Please try again later.`;
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
      validationSchema={CreateVolumeSchema}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        status,
        touched,
        values,
      }) => {
        const { config_id, linode_id } = values;

        const linodeError = touched.linode_id ? errors.linode_id : undefined;

        const generalError = status
          ? status.generalError
          : config_id !== null
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
          } else {
            setFieldValue('linode_id', null);
            setFieldValue('config_id', null);
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
                  data-qa-volume-size-help
                  variant="body1"
                >
                  {/* A single Volume can range from 10 to {MAX_VOLUME_SIZE} GB in
                  size and costs $0.10/GB per month. <br />
                  Up to eight volumes can be attached to a single Linode. */}
                  A single Volume can range from 10 to 10240 GB in size. Up to
                  eight Volumes can be attached to a single Linode. Select a
                  Region to see cost per GB.
                </Typography>
                <LabelField
                  tooltipText="Use only ASCII letters, numbers,
                  underscores, and dashes."
                  disabled={doesNotHavePermission}
                  error={touched.label ? errors.label : undefined}
                  name="label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  textFieldStyles={classes.select}
                  tooltipClasses={classes.labelTooltip}
                  tooltipPosition="right"
                  value={values.label}
                />
                <Box alignItems="flex-end" display="flex">
                  <RegionSelect
                    handleSelection={(value) => {
                      setFieldValue('region', value);
                      setFieldValue('linode_id', null);
                    }}
                    regions={
                      regions?.filter((eachRegion) =>
                        eachRegion.capabilities.some((eachCape) =>
                          eachCape.match(/block/i)
                        )
                      ) ?? []
                    }
                    disabled={doesNotHavePermission}
                    errorText={touched.region ? errors.region : undefined}
                    isClearable
                    label="Region"
                    name="region"
                    onBlur={handleBlur}
                    selectedID={values.region}
                    width={320}
                  />
                  {renderSelectTooltip(
                    'Volumes must be created in a region. You can choose to create a Volume in a region and attach it later to a Linode in the same region.'
                  )}
                </Box>
                <Box className={classes.linodeConfigSelectWrapper}>
                  <Box
                    alignItems="flex-end"
                    className={classes.linodeSelect}
                    display="flex"
                  >
                    <LinodeSelect
                      optionsFilter={(linode: Linode) => {
                        const linodeRegion = linode.region;
                        const valuesRegion = values.region;

                        /** When values.region is empty, all Linodes with
                         * block storage support will be displayed, regardless
                         * of their region. However, if a region is selected,
                         * only Linodes from the chosen region with block storage
                         * support will be shown. */
                        return isNilOrEmpty(valuesRegion)
                          ? regionsWithBlockStorage.includes(linodeRegion)
                          : regionsWithBlockStorage.includes(linodeRegion) &&
                              linodeRegion === valuesRegion;
                      }}
                      sx={{
                        width: '320px',
                      }}
                      clearable
                      disabled={doesNotHavePermission}
                      errorText={linodeError}
                      onBlur={handleBlur}
                      onSelectionChange={handleLinodeChange}
                      value={values.linode_id}
                    />
                    {renderSelectTooltip(
                      'If you select a Linode, the Volume will be automatically created in that Linode’s region and attached upon creation.'
                    )}
                  </Box>
                  <Box alignItems="flex-end" display="flex">
                    <SizeField
                      disabled={doesNotHavePermission}
                      error={touched.size ? errors.size : undefined}
                      hasSelectedRegion={!isNilOrEmpty(values.region)}
                      name="size"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      textFieldStyles={classes.size}
                      value={values.size}
                    />
                  </Box>
                  <ConfigSelect
                    disabled={doesNotHavePermission}
                    error={touched.config_id ? errors.config_id : undefined}
                    linodeId={linode_id}
                    name="configId"
                    onBlur={handleBlur}
                    onChange={(id: number) => setFieldValue('config_id', id)}
                    value={config_id}
                    width={320}
                  />
                </Box>
                <Box
                  alignItems="center"
                  className={classes.buttonGroup}
                  display="flex"
                  flexWrap="wrap"
                  justifyContent={showAgreement ? 'space-between' : 'flex-end'}
                >
                  {showAgreement ? (
                    <EUAgreementCheckbox
                      centerCheckbox
                      checked={hasSignedAgreement}
                      className={classes.agreement}
                      onChange={(e) => setHasSignedAgreement(e.target.checked)}
                    />
                  ) : null}
                </Box>
              </Paper>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  buttonType="primary"
                  className={classes.button}
                  data-qa-deploy-linode
                  disabled={disabled}
                  loading={isSubmitting}
                  onClick={() => handleSubmit()}
                  style={{ marginLeft: 12 }}
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
  config_id: null | number;
  label: string;
  linode_id: null | number;
  region: string;
  size: number;
}

const initialValues: FormState = {
  config_id: null,
  label: '',
  linode_id: null,
  region: '',
  size: 20,
};

interface StateProps {
  origin?: VolumeDrawerOrigin;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => ({
  origin: state.volumeDrawer.origin,
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(connected)(CreateVolumeForm);

export default enhanced;
