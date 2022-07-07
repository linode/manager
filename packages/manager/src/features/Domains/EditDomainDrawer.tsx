import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import Drawer from 'src/components/Drawer';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice/Notice';
import Radio from 'src/components/Radio';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { useFormik } from 'formik';
import { useUpdateDomainMutation } from 'src/queries/domains';
import { getErrorMap } from 'src/utilities/errorUtils';
import { transferHelperText as helperText } from './domainUtils';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import {
  createDomainRecord,
  Domain,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';

interface Props {
  open: boolean;
  onClose: () => void;
  domain: Domain | undefined;
}

export const EditDomainDrawer = (props: Props) => {
  const { open, onClose, domain } = props;

  const { mutateAsync: updateDomain, error, reset } = useUpdateDomainMutation();

  const formik = useFormik<UpdateDomainPayload>({
    enableReinitialize: true,
    initialValues: {
      domain: domain?.domain,
      soa_email: domain?.soa_email,
      tags: domain?.tags,
      master_ips: domain?.master_ips,
      axfr_ips: domain?.axfr_ips,
    },
    onSubmit: async (values) => {
      const primaryIPs = values?.master_ips?.filter((v) => v !== '');
      const finalTransferIPs = values?.axfr_ips?.filter((v) => v !== '');

      if (!domain) {
        return;
      }

      const data =
        domain?.type === 'master'
          ? // Not sending type for master. There is a bug on server and it returns an error that `master_ips` is required
            {
              domain: values.domain,
              tags: values.tags,
              soa_email: values.soa_email,
              id: domain.id,
            }
          : {
              domain: values.domain,
              tags: values.tags,
              master_ips: primaryIPs,
              id: domain.id,
              axfr_ips: finalTransferIPs,
            };

      await updateDomain(data);
      onClose();
    },
  });

  const errorMap = getErrorMap(
    [
      'axfr_ips',
      'master_ips',
      'domain',
      'type',
      'soa_email',
      'tags',
      'defaultNodeBalancer',
      'defaultLinode',
    ],
    error
  );

  React.useEffect(() => {
    // Reset the React Query Mutation hook if the user opens the dialog and there was a previous error
    if (open && error) {
      reset();
    }
  }, [open]);

  const isEditingPrimaryDomain = domain?.type === 'master';
  const isEditingSecondaryDomain = domain?.type === 'slave';

  const handleTransferInput = (newIPs: ExtendedIP[]) => {
    const axfr_ips = newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    formik.setFieldValue('axfr_ips', axfr_ips);
  };

  const updatePrimaryIPAddress = (newIPs: ExtendedIP[]) => {
    const master_ips =
      newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];

    formik.setFieldValue('master_ips', master_ips);
  };

  const disabled = false;

  return (
    <Drawer title="Edit Domain" open={open} onClose={onClose}>
      {errorMap.none && !disabled && (
        <Notice error spacingTop={8}>
          {errorMap.none}
        </Notice>
      )}
      <form onSubmit={formik.handleSubmit}>
        <RadioGroup aria-label="type" name="type" value={domain?.type} row>
          <FormControlLabel
            value="master"
            label="Primary"
            control={<Radio />}
            data-qa-domain-radio="Primary"
            disabled
          />
          <FormControlLabel
            value="slave"
            label="Secondary"
            control={<Radio />}
            data-qa-domain-radio="Secondary"
            disabled
          />
        </RadioGroup>
        <TextField
          value={formik.values.domain}
          disabled={disabled}
          label="Domain"
          id="domain"
          name="domain"
          onChange={formik.handleChange}
          errorText={errorMap.domain}
          data-qa-domain-name
          data-testid="domain-name-input"
        />
        {isEditingPrimaryDomain && (
          <TextField
            errorText={errorMap.soa_email}
            value={formik.values.soa_email}
            id="soa_email"
            name="soa_email"
            label="SOA Email Address"
            onChange={formik.handleChange}
            data-qa-soa-email
            data-testid="soa-email-input"
            disabled={disabled}
          />
        )}
        {isEditingSecondaryDomain && (
          <React.Fragment>
            <MultipleIPInput
              title="Primary Nameserver IP Address"
              ips={formik.values?.master_ips?.map(stringToExtendedIP) ?? []}
              onChange={updatePrimaryIPAddress}
              error={errorMap.master_ips}
            />
            {isEditingSecondaryDomain && (
              // Only when editing
              <MultipleIPInput
                title="Domain Transfer IPs"
                helperText={helperText}
                ips={formik.values?.axfr_ips?.map(stringToExtendedIP) ?? []}
                onChange={handleTransferInput}
                error={errorMap.axfr_ips}
              />
            )}
          </React.Fragment>
        )}
        <TagsInput
          value={
            formik.values?.tags?.map((tag) => ({ label: tag, value: tag })) ??
            []
          }
          onChange={(tags) =>
            formik.setFieldValue(
              'tags',
              tags.map((tag) => tag.value)
            )
          }
          tagError={errorMap.tags}
          disabled={disabled}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            disabled={disabled}
            loading={formik.isSubmitting}
            type="submit"
            data-qa-submit
            data-testid="create-domain-submit"
          >
            Save Changes
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export const generateDefaultDomainRecords = (
  domain: string,
  domainID: number,
  ipv4?: string,
  ipv6?: string | null
) => {
  /**
   * At this point, the IPv6 is including the prefix and we need to strip that
   *
   * BUT
   *
   * this logic only applies to Linodes' ipv6, not NodeBalancers. No stripping
   * needed for NodeBalancers.
   */
  const cleanedIPv6 =
    ipv6 && ipv6.includes('/') ? ipv6.substr(0, ipv6.indexOf('/')) : ipv6;

  const baseIPv4Requests = [
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'www',
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'mail',
    }),
  ];

  return Promise.all(
    /** ipv6 can be null so don't try to create domain records in that case */
    !!cleanedIPv6
      ? [
          ...baseIPv4Requests,
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'www',
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'mail',
          }),
          createDomainRecord(domainID, {
            type: 'MX',
            priority: 10,
            target: `mail.${domain}`,
          }),
        ]
      : baseIPv4Requests
  );
};
