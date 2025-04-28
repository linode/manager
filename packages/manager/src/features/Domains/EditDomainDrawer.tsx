import { useGrants, useProfile } from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  TextField,
} from '@linode/ui';
import { useFormik } from 'formik';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { useUpdateDomainMutation } from 'src/queries/domains';
import { getErrorMap } from 'src/utilities/errorUtils';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';
import { extendedIPToString, stringToExtendedIP } from 'src/utilities/ipUtils';

import { transferHelperText as helperText } from './domainUtils';

import type { Domain, UpdateDomainPayload } from '@linode/api-v4/lib/domains';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface EditDomainDrawerProps {
  domain: Domain | undefined;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}

export const EditDomainDrawer = (props: EditDomainDrawerProps) => {
  const { domain, isFetching, onClose, open } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const { error, mutateAsync: updateDomain, reset } = useUpdateDomainMutation();

  const formik = useFormik<UpdateDomainPayload>({
    enableReinitialize: true,
    initialValues: {
      axfr_ips: domain?.axfr_ips,
      domain: domain?.domain,
      master_ips: domain?.master_ips,
      soa_email: domain?.soa_email,
      tags: domain?.tags,
    },
    onSubmit: async (values) => {
      if (!domain) {
        return;
      }

      const primaryIPs = values?.master_ips?.filter((v) => v !== '');
      const finalTransferIPs = values?.axfr_ips?.filter((v) => v !== '');

      const data =
        domain.type === 'master'
          ? // Not sending type for master. There is a bug on server and it returns an error that `master_ips` is required
            {
              domain: values.domain,
              id: domain.id,
              soa_email: values.soa_email,
              tags: values.tags,
            }
          : {
              axfr_ips: finalTransferIPs,
              domain: values.domain,
              id: domain.id,
              master_ips: primaryIPs,
              tags: values.tags,
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
    if (open) {
      reset();
      formik.resetForm();
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

  const canEdit = !(
    profile?.restricted &&
    grants?.domain.find((grant) => grant.id === domain?.id)?.permissions ===
      'read_only'
  );

  const disabled = !canEdit;

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Edit Domain"
    >
      {!canEdit && (
        <Notice variant="error">
          You do not have permission to modify this Domain.
        </Notice>
      )}
      {errorMap.none && <Notice variant="error">{errorMap.none}</Notice>}
      <form onSubmit={formik.handleSubmit}>
        <RadioGroup aria-label="type" name="type" row value={domain?.type}>
          <FormControlLabel
            control={<Radio />}
            data-qa-domain-radio="Primary"
            disabled
            label="Primary"
            value="master"
          />
          <FormControlLabel
            control={<Radio />}
            data-qa-domain-radio="Secondary"
            disabled
            label="Secondary"
            value="slave"
          />
        </RadioGroup>
        <TextField
          data-qa-domain-name
          data-testid="domain-name-input"
          disabled={disabled}
          errorText={errorMap.domain}
          id="domain"
          label="Domain"
          name="domain"
          onChange={formik.handleChange}
          value={formik.values.domain}
        />
        {isEditingPrimaryDomain && (
          <TextField
            data-qa-soa-email
            data-testid="soa-email-input"
            disabled={disabled}
            errorText={errorMap.soa_email}
            id="soa_email"
            label="SOA Email Address"
            name="soa_email"
            onBlur={(e) => handleFormikBlur(e, formik)}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.soa_email}
          />
        )}
        {isEditingSecondaryDomain && (
          <React.Fragment>
            <MultipleIPInput
              error={errorMap.master_ips}
              ips={formik.values?.master_ips?.map(stringToExtendedIP) ?? []}
              onChange={updatePrimaryIPAddress}
              title="Primary Nameserver IP Address"
            />
            {isEditingSecondaryDomain && (
              // Only when editing
              <MultipleIPInput
                error={errorMap.axfr_ips}
                helperText={helperText}
                ips={formik.values?.axfr_ips?.map(stringToExtendedIP) ?? []}
                onChange={handleTransferInput}
                title="Domain Transfer IPs"
              />
            )}
          </React.Fragment>
        )}
        <TagsInput
          disabled={disabled}
          onChange={(tags) =>
            formik.setFieldValue(
              'tags',
              tags.map((tag) => tag.value)
            )
          }
          tagError={errorMap.tags}
          value={
            formik.values?.tags?.map((tag) => ({ label: tag, value: tag })) ??
            []
          }
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: disabled || !formik.dirty,
            label: 'Save Changes',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
