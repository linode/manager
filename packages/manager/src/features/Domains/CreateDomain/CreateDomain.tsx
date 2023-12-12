import { Linode } from '@linode/api-v4';
import {
  CreateDomainPayload,
  Domain,
  DomainType,
} from '@linode/api-v4/lib/domains';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { createDomainSchema } from '@linode/validation/lib/domains.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { path } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormHelperText } from 'src/components/FormHelperText';
import { LandingHeader } from 'src/components/LandingHeader';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { reportException } from 'src/exceptionReporting';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useCreateDomainMutation } from 'src/queries/domains';
import { useGrants, useProfile } from 'src/queries/profile';
import { sendCreateDomainEvent } from 'src/utilities/analytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { generateDefaultDomainRecords } from '../domainUtils';

type DefaultRecordsType = 'linode' | 'nodebalancer' | 'none';

export const CreateDomain = () => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { mutateAsync: createDomain } = useCreateDomainMutation();

  const disabled = profile?.restricted && !grants?.global.add_domains;

  const [mounted, setMounted] = React.useState<boolean>(false);
  // Errors for selecting Linode/NB for default records aren't part
  // of the payload and must be handled separately.
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const history = useHistory();

  const [defaultRecordsSetting, setDefaultRecordsSetting] = React.useState<
    Item<DefaultRecordsType>
  >({
    label: 'Do not insert default records for me.',
    value: 'none',
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
      master_ips: [''],
      soa_email: '',
      type: 'master' as DomainType,
    },
    onSubmit: (values) => create(values),
    validateOnChange: true,
    validateOnMount: true,
    validationSchema: createDomainSchema,
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

  const redirect = (id: '' | number, state?: Record<string, string>) => {
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
    const { domain, master_ips, soa_email: soaEmail, tags, type } = _values;

    /**
     * In this case, the user wants default domain records created, but
     * they haven't supplied a Linode or NodeBalancer
     */
    if (defaultRecordsSetting.value === 'linode' && !selectedDefaultLinode) {
      return setErrors([
        {
          field: 'defaultLinode',
          reason: 'Please select a Linode.',
        },
      ]);
    }

    if (
      defaultRecordsSetting.value === 'nodebalancer' &&
      !selectedDefaultNodeBalancer
    ) {
      return setErrors([
        {
          field: 'defaultNodeBalancer',
          reason: 'Please select a NodeBalancer.',
        },
      ]);
    }

    const data =
      type === 'master'
        ? { domain, soa_email: soaEmail, tags, type }
        : { domain, master_ips, tags, type };

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
                    domainID: domainData.id,
                    ipv4: path(['ipv4', 0], selectedDefaultLinode),
                    ipv6: path(['ipv6'], selectedDefaultLinode),
                    selectedLinode: selectedDefaultLinode!.id,
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
                    domainID: domainData.id,
                    ipv4: path(['ipv4'], selectedDefaultNodeBalancer),
                    ipv6: path(['ipv6'], selectedDefaultNodeBalancer),
                    selectedNodeBalancer: selectedDefaultNodeBalancer!.id,
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
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/dns-manager/"
        title="Create"
      />
      <StyledGrid>
        {generalError && !disabled && (
          <Notice spacingTop={8} variant="error">
            {generalError}
          </Notice>
        )}
        {disabled && (
          <Notice
            text={
              "You don't have permissions to create a new Domain. Please contact an account administrator for details."
            }
            important
            variant="error"
          />
        )}

        <Paper data-qa-label-header>
          <StyledForm onSubmit={formik.handleSubmit}>
            <StyledRadioGroup
              aria-label="type"
              name="type"
              onChange={updateType}
              row
              value={values.type}
            >
              <FormControlLabel
                control={<Radio />}
                data-qa-domain-radio="Primary"
                disabled={disabled}
                label="Primary"
                value="master"
              />
              <FormControlLabel
                control={<Radio />}
                data-qa-domain-radio="Secondary"
                disabled={disabled}
                label="Secondary"
                value="slave"
              />
            </StyledRadioGroup>
            <TextField
              errorText={
                formik.touched.domain ? formik.errors.domain : undefined
              }
              data-qa-domain-name
              data-testid="domain-name-input"
              disabled={disabled}
              label="Domain"
              onBlur={() => formik.setFieldTouched('domain')}
              onChange={formik.handleChange}
              required
              value={values.domain}
            />
            {isCreatingPrimaryDomain && (
              <TextField
                errorText={
                  formik.touched.soa_email ? formik.errors.soa_email : undefined
                }
                data-qa-soa-email
                data-testid="soa-email-input"
                disabled={disabled}
                label="SOA Email Address"
                name={'soa_email'}
                onBlur={(e) => handleFormikBlur(e, formik)}
                onChange={formik.handleChange}
                required
                type="email"
                value={values.soa_email}
              />
            )}
            {isCreatingSecondaryDomain && (
              <StyledMultipleIPInput
                error={
                  formik.touched.master_ips
                    ? (primaryIPsError as string | undefined)
                    : undefined
                }
                ips={values.master_ips.map(stringToExtendedIP)}
                onChange={updatePrimaryIPAddress}
                required
                title="Primary Nameserver IP Address"
              />
            )}
            {isCreatingPrimaryDomain && (
              <React.Fragment>
                <Select
                  onChange={(value: Item<DefaultRecordsType>) =>
                    setDefaultRecordsSetting(value)
                  }
                  options={[
                    {
                      label: 'Do not insert default records for me.',
                      value: 'none',
                    },
                    {
                      label: 'Insert default records from one of my Linodes.',
                      value: 'linode',
                    },
                    {
                      label:
                        'Insert default records from one of my NodeBalancers.',
                      value: 'nodebalancer',
                    },
                  ]}
                  disabled={disabled}
                  isClearable={false}
                  label="Insert Default Records"
                  value={defaultRecordsSetting}
                />
                <StyledFormHelperText>
                  If specified, we can automatically create some domain records
                  (A/AAAA and MX) to get you started, based on one of your
                  Linodes or NodeBalancers.
                </StyledFormHelperText>
              </React.Fragment>
            )}
            {isCreatingPrimaryDomain &&
              defaultRecordsSetting.value === 'linode' && (
                <React.Fragment>
                  <LinodeSelect
                    onSelectionChange={(value) =>
                      setSelectedDefaultLinode(value ?? undefined)
                    }
                    disabled={disabled}
                    errorText={errorMap.defaultLinode}
                    value={selectedDefaultLinode?.id ?? null}
                  />
                  {!errorMap.defaultLinode && (
                    <FormHelperText>
                      {selectedDefaultLinode && !selectedDefaultLinode.ipv6
                        ? `We'll automatically create domains for the first IPv4 address on this Linode.`
                        : `We'll automatically create domain records for both the first IPv4 and IPv6 addresses on this Linode.`}
                    </FormHelperText>
                  )}
                </React.Fragment>
              )}
            {isCreatingPrimaryDomain &&
              defaultRecordsSetting.value === 'nodebalancer' && (
                <React.Fragment>
                  <NodeBalancerSelect
                    onSelectionChange={(value) =>
                      setSelectedDefaultNodeBalancer(value ?? undefined)
                    }
                    disabled={disabled}
                    errorText={errorMap.defaultNodeBalancer}
                    value={selectedDefaultNodeBalancer?.id ?? null}
                  />
                  {!errorMap.defaultNodeBalancer && (
                    <FormHelperText>
                      {selectedDefaultNodeBalancer &&
                      !selectedDefaultNodeBalancer.ipv6
                        ? `We'll automatically create domains for the first IPv4 address on this NodeBalancer.`
                        : `We'll automatically create domain records for both the first IPv4 and IPv6 addresses on this NodeBalancer.`}
                    </FormHelperText>
                  )}
                </React.Fragment>
              )}
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: disabled || !formik.isValid,
                label: 'Create Domain',
                loading: formik.isSubmitting,
                onClick: () => formik.handleSubmit(),
              }}
            />
          </StyledForm>
        </Paper>
      </StyledGrid>
    </Grid>
  );
};

const StyledGrid = styled(Grid, { label: 'StyledGrid' })({
  width: '100%',
});

const StyledForm = styled('form', { label: 'StyledForm' })(({ theme }) => ({
  '& > div': {
    marginBottom: theme.spacing(2),
  },
  '& label': {
    color: theme.color.headline,
    letterSpacing: '0.25px',
    lineHeight: '1.33rem',
    margin: 0,
  },
}));

const StyledRadioGroup = styled(RadioGroup, { label: 'StyledRadioGroup' })({
  '& label:first-of-type .MuiButtonBase-root': {
    marginLeft: -10,
  },
});

const StyledMultipleIPInput = styled(MultipleIPInput, {
  label: 'StyledMultipeIPInput',
})({
  maxWidth: 468,
});

const StyledFormHelperText = styled(FormHelperText, {
  label: 'StyledFormHelperText',
})({
  maxWidth: 'none',
});
