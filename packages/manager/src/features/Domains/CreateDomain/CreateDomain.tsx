import { useGrants, useProfile } from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  ActionsPanel,
  Autocomplete,
  FormControlLabel,
  FormHelperText,
  Notice,
  Paper,
  Radio,
  RadioGroup,
  TextField,
} from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { createDomainSchema } from '@linode/validation/lib/domains.schema';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { reportException } from 'src/exceptionReporting';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useCreateDomainMutation } from 'src/queries/domains';
import { sendCreateDomainEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';
import { extendedIPToString, stringToExtendedIP } from 'src/utilities/ipUtils';

import { generateDefaultDomainRecords } from '../domainUtils';

import type { Linode } from '@linode/api-v4';
import type {
  CreateDomainPayload,
  Domain,
  DomainType,
} from '@linode/api-v4/lib/domains';
import type { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import type { APIError } from '@linode/api-v4/lib/types';
import type { DomainState } from 'src/routes/domains';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface DefaultRecordsSetting {
  label: string;
  value: 'linode' | 'nodebalancer' | 'none';
}

export const CreateDomain = () => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { mutateAsync: createDomain } = useCreateDomainMutation();

  const disabled = profile?.restricted && !grants?.global.add_domains;

  const [mounted, setMounted] = React.useState<boolean>(false);
  // Errors for selecting Linode/NB for default records aren't part
  // of the payload and must be handled separately.
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const navigate = useNavigate();

  const defaultRecords: DefaultRecordsSetting[] = [
    {
      label: 'Do not insert default records for me.',
      value: 'none',
    },
    {
      label: 'Insert default records from one of my Linodes.',
      value: 'linode',
    },
    {
      label: 'Insert default records from one of my NodeBalancers.',
      value: 'nodebalancer',
    },
  ];

  const [defaultRecordsSetting, setDefaultRecordsSetting] =
    React.useState<DefaultRecordsSetting>(defaultRecords[0]);

  const [selectedDefaultLinode, setSelectedDefaultLinode] = React.useState<
    Linode | undefined
  >(undefined);
  const [selectedDefaultNodeBalancer, setSelectedDefaultNodeBalancer] =
    React.useState<NodeBalancer | undefined>(undefined);

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

  const redirect = (id: null | number, state?: DomainState) => {
    const returnPath = id ? `/domains/${id}` : '/domains';
    navigate({
      params: { domainId: Number(id) },
      state: (prev) => ({ ...prev, ...state }),
      to: returnPath,
    });
  };

  const redirectToLandingOrDetail = (
    type: 'master' | 'slave',
    domainID: number,
    state: DomainState = {}
  ) => {
    if (type === 'master' && domainID) {
      redirect(domainID, state);
    } else {
      redirect(null, state);
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
              selectedDefaultLinode?.ipv4?.[0],
              selectedDefaultLinode?.ipv6
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from Linode: ${e[0].reason}`,
                  {
                    domainID: domainData.id,
                    ipv4: selectedDefaultLinode?.ipv4?.[0],
                    ipv6: selectedDefaultLinode?.ipv6,
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
              selectedDefaultNodeBalancer?.ipv4,
              selectedDefaultNodeBalancer?.ipv6
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from NodeBalancer: ${e[0].reason}`,
                  {
                    domainID: domainData.id,
                    ipv4: selectedDefaultNodeBalancer?.ipv4,
                    ipv6: selectedDefaultNodeBalancer?.ipv6,
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
    const masterIps = newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (mounted) {
      formik.setFieldValue('master_ips', masterIps);
    }
  };

  return (
    <Grid container>
      <DocumentTitleSegment segment="Create a Domain" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/dns-manager"
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
              data-qa-domain-name
              data-testid="domain-name-input"
              disabled={disabled}
              errorText={
                formik.touched.domain ? formik.errors.domain : undefined
              }
              label="Domain"
              onBlur={() => formik.setFieldTouched('domain')}
              onChange={formik.handleChange}
              required
              value={values.domain}
            />
            {isCreatingPrimaryDomain && (
              <TextField
                data-qa-soa-email
                data-testid="soa-email-input"
                disabled={disabled}
                errorText={
                  formik.touched.soa_email ? formik.errors.soa_email : undefined
                }
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
                <Autocomplete
                  disableClearable
                  disabled={disabled}
                  label="Insert Default Records"
                  onChange={(_, selected) => setDefaultRecordsSetting(selected)}
                  options={defaultRecords}
                  value={defaultRecords.find(
                    (dr) => dr.value === defaultRecordsSetting.value
                  )}
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
                    disabled={disabled}
                    errorText={errorMap.defaultLinode}
                    onSelectionChange={(value) =>
                      setSelectedDefaultLinode(value ?? undefined)
                    }
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
                    disabled={disabled}
                    errorText={errorMap.defaultNodeBalancer}
                    onSelectionChange={(value) =>
                      setSelectedDefaultNodeBalancer(value ?? undefined)
                    }
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
