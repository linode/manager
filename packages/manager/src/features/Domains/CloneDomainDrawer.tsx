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
import { useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import React from 'react';

import { useCloneDomainMutation } from 'src/queries/domains';

import type { APIError, Domain } from '@linode/api-v4';

interface CloneDomainDrawerProps {
  domain: Domain | undefined;
  domainError: APIError[] | null;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}

export const CloneDomainDrawer = (props: CloneDomainDrawerProps) => {
  const { domain, domainError, isFetching, onClose: _onClose, open } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const {
    error,
    mutateAsync: cloneDomain,
    reset,
  } = useCloneDomainMutation(domain?.id ?? 0);

  const navigate = useNavigate();

  const formik = useFormik<{ domain: string }>({
    initialValues: { domain: '' },
    onSubmit: async (values) => {
      const newDomain = await cloneDomain(values);
      onClose();
      navigate({
        params: { domainId: newDomain.id },
        to: '/domains/$domainId',
      });
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
    reset();
  };

  const noPermission = profile?.restricted && !grants?.global.add_domains;

  return (
    <Drawer
      error={domainError}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title="Clone Domain"
    >
      {noPermission && (
        <Notice variant="error">
          You do not have permission to create new Domains.
        </Notice>
      )}
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
          disabled
          label="Domain"
          value={domain?.domain}
        />
        <TextField
          data-qa-clone-name
          disabled={noPermission}
          errorText={error ? error[0]?.reason : undefined}
          id="domain"
          label="New Domain"
          name="domain"
          onChange={formik.handleChange}
          value={formik.values.domain}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-domain-submit',
            disabled: !formik.dirty,
            label: 'Create Domain',
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
