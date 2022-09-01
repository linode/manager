import {
  CreateDomainPayload,
  Domain,
  DomainType,
} from '@linode/api-v4/lib/domains';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { createDomainSchema } from '@linode/validation/lib/domains.schema';
import { useFormik } from 'formik';
import { path } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocsLink from 'src/components/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { reportException } from 'src/exceptionReporting';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import NodeBalancerSelect from 'src/features/NodeBalancers/NodeBalancerSelect';
import { hasGrant } from 'src/features/Profile/permissionsHelpers';
import { useCreateDomainMutation } from 'src/queries/domains';
import { useGrants, useProfile } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { sendCreateDomainEvent } from 'src/utilities/ga';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { generateDefaultDomainRecords } from '../domainUtils';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    width: '100%',
  },
  inner: {
    '& > div': {
      marginBottom: theme.spacing(2),
    },
    '& label': {
      color: theme.color.headline,
      lineHeight: '1.33rem',
      letterSpacing: '0.25px',
      margin: 0,
    },
  },
  radio: {
    '& label:first-child .MuiButtonBase-root': {
      marginLeft: -10,
    },
  },
  ip: {
    maxWidth: 468,
  },
  helperText: {
    maxWidth: 'none',
  },
}));

type DefaultRecordsType = 'none' | 'linode' | 'nodebalancer';

export const CreateDomain = () => {
  const classes = useStyles();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { mutateAsync: createDomain } = useCreateDomainMutation();

  const disabled = profile?.restricted && !hasGrant('add_domains', grants);

  const [mounted, setMounted] = React.useState<boolean>(false);
  // Errors for selecting Linode/NB for default records aren't part
  // of the payload and must be handled separately.
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const history = useHistory();

  const [defaultRecordsSetting, setDefaultRecordsSetting] = React.useState<
    Item<DefaultRecordsType>
  >({
    value: 'none',
    label: 'Do not insert default records for me.',
  });

  const [selectedDefaultLinode, setSelectedDefaultLinode] = React.useState<
    Linode | undefined
  >(undefined);
  const [
    selectedDefaultNodeBalancer,
    setSelectedDefaultNodeBalancer,
  ] = React.useState<NodeBalancer | undefined>(undefined);

  const { values, ...formik } = useFormik({
    initialValues: {
      domain: '',
      type: 'master' as DomainType,
      soa_email: '',
      master_ips: [''],
    },
    validationSchema: createDomainSchema,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => create(values),
  });

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const errorMap = getErrorMap(
    ['defaultLinode', 'defaultNodeBalancer'],
    errors
  );

  const generalError = formik.status?.generalError || errorMap.none;
  const primaryIPsError = formik.errors.master_ips;

  const isCreatingPrimaryDomain = values.type === 'master';
  const isCreatingSecondaryDomain = values.type === 'slave';

  const redirect = (id: number | '', state?: Record<string, string>) => {
    const returnPath = !!id ? `/domains/${id}` : '/domains';
    history.push(returnPath, state);
  };

  const redirectToLandingOrDetail = (
    type: 'master' | 'slave',
    domainID: number,
    state: Record<string, string> = {}
  ) => {
    if (type === 'master' && domainID) {
      redirect(domainID, state);
    } else {
      redirect('', state);
    }
  };

  const create = (_values: CreateDomainPayload) => {
    const { domain, type, master_ips, soa_email: soaEmail, tags } = _values;

    /**
     * In this case, the user wants default domain records created, but
     * they haven't supplied a Linode or NodeBalancer
     */
    if (defaultRecordsSetting.value === 'linode' && !selectedDefaultLinode) {
      return setErrors([
        {
          reason: 'Please select a Linode.',
          field: 'defaultLinode',
        },
      ]);
    }

    if (
      defaultRecordsSetting.value === 'nodebalancer' &&
      !selectedDefaultNodeBalancer
    ) {
      return setErrors([
        {
          reason: 'Please select a NodeBalancer.',
          field: 'defaultNodeBalancer',
        },
      ]);
    }

    const data =
      type === 'master'
        ? { domain, type, tags, soa_email: soaEmail }
        : { domain, type, tags, master_ips };

    formik.setSubmitting(true);
    createDomain(data)
      .then((domainData: Domain) => {
        if (!mounted) {
          return;
        }
        sendCreateDomainEvent('Domain Create Page');
        /**
         * Now we check to see if the user wanted us to automatically create
         * domain records for them. If so, create some A/AAAA and MX records
         * with the first IPv4 and IPv6 from the Linode or NodeBalancer they
         * selected.
         *
         * This only applies to master domains.
         */
        if (values.type === 'master') {
          if (defaultRecordsSetting.value === 'linode') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4', 0], selectedDefaultLinode),
              path(['ipv6'], selectedDefaultLinode)
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from Linode: ${e[0].reason}`,
                  {
                    selectedLinode: selectedDefaultLinode!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4', 0], selectedDefaultLinode),
                    ipv6: path(['ipv6'], selectedDefaultLinode),
                  }
                );
                return redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.',
                });
              });
          }

          if (defaultRecordsSetting.value === 'nodebalancer') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4'], selectedDefaultNodeBalancer),
              path(['ipv6'], selectedDefaultNodeBalancer)
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from NodeBalancer: ${e[0].reason}`,
                  {
                    selectedNodeBalancer: selectedDefaultNodeBalancer!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4'], selectedDefaultNodeBalancer),
                    ipv6: path(['ipv6'], selectedDefaultNodeBalancer),
                  }
                );
                return redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.',
                });
              });
          }
        }
        return redirectToLandingOrDetail(type, domainData.id);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }
        const mapErrorToStatus = (generalError: string) =>
          formik.setStatus({ generalError });
        formik.setSubmitting(false);
        handleFieldErrors(formik.setErrors, err);
        handleGeneralErrors(
          mapErrorToStatus,
          err,
          'An unexpected error occurred.'
        );
        scrollErrorIntoView();
      });
  };

  const updateSelectedLinode = (linode: Linode) =>
    setSelectedDefaultLinode(linode);

  const updateSelectedNodeBalancer = (nodebalancer: NodeBalancer) =>
    setSelectedDefaultNodeBalancer(nodebalancer);

  const updateInsertDefaultRecords = (value: Item<DefaultRecordsType>) =>
    setDefaultRecordsSetting(value);

  const updateType = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'master' | 'slave'
  ) => {
    formik.setFieldValue('type', value);
    setErrors([]);
  };

  const updatePrimaryIPAddress = (newIPs: ExtendedIP[]) => {
    const master_ips =
      newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (mounted) {
      formik.setFieldValue('master_ips', master_ips);
    }
  };

  return (
    <Grid container>
      <DocumentTitleSegment segment="Create Domain" />
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item className="p0">
          <Breadcrumb
            pathname={location.pathname}
            labelTitle="Create"
            labelOptions={{ noCap: true }}
          />
        </Grid>
        <Grid item className="p0">
          <DocsLink href="https://www.linode.com/docs/guides/dns-manager/" />
        </Grid>
      </Grid>

      <Grid item className={classes.main}>
        {generalError && !disabled && (
          <Notice error spacingTop={8}>
            {generalError}
          </Notice>
        )}
        {disabled && (
          <Notice
            text={
              "You don't have permissions to create a new Domain. Please contact an account administrator for details."
            }
            error
            important
          />
        )}

        <Paper data-qa-label-header>
          <form onSubmit={formik.handleSubmit} className={classes.inner}>
            <RadioGroup
              aria-label="type"
              className={classes.radio}
              name="type"
              onChange={updateType}
              row
              value={values.type}
            >
              <FormControlLabel
                value="master"
                label="Primary"
                control={<Radio />}
                data-qa-domain-radio="Primary"
                disabled={disabled}
              />
              <FormControlLabel
                value="slave"
                label="Secondary"
                control={<Radio />}
                data-qa-domain-radio="Secondary"
                disabled={disabled}
              />
            </RadioGroup>
            <TextField
              required
              errorText={
                formik.touched.domain ? formik.errors.domain : undefined
              }
              value={values.domain}
              disabled={disabled}
              label="Domain"
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('domain')}
              data-qa-domain-name
              data-testid="domain-name-input"
            />
            {isCreatingPrimaryDomain && (
              <TextField
                required
                name={'soa_email'}
                errorText={
                  formik.touched.soa_email ? formik.errors.soa_email : undefined
                }
                value={values.soa_email}
                label="SOA Email Address"
                onChange={formik.handleChange}
                onBlur={() => formik.setFieldTouched('soa_email')}
                data-qa-soa-email
                data-testid="soa-email-input"
                disabled={disabled}
              />
            )}
            {isCreatingSecondaryDomain && (
              <MultipleIPInput
                title="Primary Nameserver IP Address"
                className={classes.ip}
                error={
                  formik.touched.master_ips
                    ? (primaryIPsError as string | undefined)
                    : undefined
                }
                ips={values.master_ips.map(stringToExtendedIP)}
                onChange={updatePrimaryIPAddress}
                required
              />
            )}
            {isCreatingPrimaryDomain && (
              <React.Fragment>
                <Select
                  isClearable={false}
                  onChange={(value: Item<DefaultRecordsType>) =>
                    updateInsertDefaultRecords(value)
                  }
                  value={defaultRecordsSetting}
                  label="Insert Default Records"
                  options={[
                    {
                      value: 'none',
                      label: 'Do not insert default records for me.',
                    },
                    {
                      value: 'linode',
                      label: 'Insert default records from one of my Linodes.',
                    },
                    {
                      value: 'nodebalancer',
                      label:
                        'Insert default records from one of my NodeBalancers.',
                    },
                  ]}
                  disabled={disabled}
                />
                <FormHelperText className={classes.helperText}>
                  If specified, we can automatically create some domain records
                  (A/AAAA and MX) to get you started, based on one of your
                  Linodes or NodeBalancers.
                </FormHelperText>
              </React.Fragment>
            )}
            {isCreatingPrimaryDomain &&
              defaultRecordsSetting.value === 'linode' && (
                <React.Fragment>
                  <LinodeSelect
                    linodeError={errorMap.defaultLinode}
                    handleChange={updateSelectedLinode}
                    selectedLinode={
                      selectedDefaultLinode ? selectedDefaultLinode.id : null
                    }
                    disabled={disabled}
                  />
                  {!errorMap.defaultLinode && (
                    <FormHelperText>
                      {selectedDefaultLinode && !selectedDefaultLinode.ipv6
                        ? `We'll automatically create domains for the first IPv4 address on this
                  Linode.`
                        : `We'll automatically create domain records for both the first
                  IPv4 and IPv6 addresses on this Linode.`}
                    </FormHelperText>
                  )}
                </React.Fragment>
              )}
            {isCreatingPrimaryDomain &&
              defaultRecordsSetting.value === 'nodebalancer' && (
                <React.Fragment>
                  <NodeBalancerSelect
                    nodeBalancerError={errorMap.defaultNodeBalancer}
                    handleChange={updateSelectedNodeBalancer}
                    selectedNodeBalancer={
                      selectedDefaultNodeBalancer
                        ? selectedDefaultNodeBalancer.id
                        : null
                    }
                    disabled={disabled}
                  />
                  {!errorMap.defaultNodeBalancer && (
                    <FormHelperText>
                      {selectedDefaultNodeBalancer &&
                      !selectedDefaultNodeBalancer.ipv6
                        ? `We'll automatically create domains for the first IPv4 address on this
                NodeBalancer.`
                        : `We'll automatically create domain records for both the first
                IPv4 and IPv6 addresses on this NodeBalancer.`}
                    </FormHelperText>
                  )}
                </React.Fragment>
              )}
            <ActionsPanel>
              <Button
                buttonType="primary"
                onClick={() => formik.handleSubmit()}
                data-qa-submit
                data-testid="create-domain-submit"
                loading={formik.isSubmitting}
                disabled={disabled || !formik.isValid}
              >
                Create Domain
              </Button>
            </ActionsPanel>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CreateDomain;
