import React from 'react';
import Drawer from 'src/components/Drawer/Drawer';
import RadioGroup from 'src/components/core/RadioGroup';
import FormControlLabel from 'src/components/core/FormControlLabel';
import TextField from 'src/components/TextField';
import Radio from 'src/components/Radio/Radio';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Button from 'src/components/Button/Button';
import { useCloneDomainMutation } from 'src/queries/domains';
import { useFormik } from 'formik';
import { Domain } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  domain: Domain | undefined;
}

export const CloneDomainDrawer = (props: Props) => {
  const { onClose, open, domain } = props;

  const { mutateAsync: cloneDomain, error } = useCloneDomainMutation(
    domain?.id ?? 0
  );

  const formik = useFormik<{ domain: string }>({
    initialValues: { domain: '' },
    onSubmit: async (values) => {
      await cloneDomain(values);
      onClose();
    },
  });

  return (
    <Drawer title="Clone Domain" open={open} onClose={onClose}>
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
          value={domain?.domain}
          disabled
          label="Domain"
          data-qa-domain-name
          data-testid="domain-name-input"
        />
        <TextField
          id="domain"
          name="domain"
          value={formik.values.domain}
          label="New Domain"
          onChange={formik.handleChange}
          data-qa-clone-name
          errorText={error ? error[0]?.reason : undefined}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            loading={formik.isSubmitting}
            type="submit"
            data-qa-submit
            data-testid="create-domain-submit"
          >
            Create Domain
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
