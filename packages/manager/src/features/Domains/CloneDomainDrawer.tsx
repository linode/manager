import { Domain } from '@linode/api-v4';
import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { RadioGroup } from 'src/components/RadioGroup';
import { useCloneDomainMutation } from 'src/queries/domains';
import { useGrants, useProfile } from 'src/queries/profile';

interface CloneDomainDrawerProps {
  domain: Domain | undefined;
  onClose: () => void;
  open: boolean;
}

export const CloneDomainDrawer = (props: CloneDomainDrawerProps) => {
  const { domain, onClose: _onClose, open } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const { error, mutateAsync: cloneDomain, reset } = useCloneDomainMutation(
    domain?.id ?? 0
  );

  const history = useHistory();

  const formik = useFormik<{ domain: string }>({
    initialValues: { domain: '' },
    onSubmit: async (values) => {
      const newDomain = await cloneDomain(values);
      history.push(`/domains/${newDomain.id}`);
      onClose();
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
    reset();
  };

  const noPermission = profile?.restricted && !grants?.global.add_domains;

  return (
    <Drawer onClose={onClose} open={open} title="Clone Domain">
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
          secondaryButtonProps={{ 'data-testid': 'cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
