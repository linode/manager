import * as React from 'react';
import { IPAddress } from '@linode/api-v4/lib/networking';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { Typography } from 'src/components/Typography';
import Drawer from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { Notice } from 'src/components/Notice/Notice';
import { useLinodeIPMutation } from 'src/queries/linodes/networking';

interface Props {
  open: boolean;
  onClose: () => void;
  ip: IPAddress | undefined;
}

export const EditIPRDNSDrawer = (props: Props) => {
  const { open, onClose, ip } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: updateIP,
    isLoading,
    error,
    reset,
  } = useLinodeIPMutation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rdns: ip?.rdns,
    },
    async onSubmit(values) {
      await updateIP({
        address: ip?.address ?? '',
        rdns: values.rdns === '' ? null : values.rdns,
      });
      enqueueSnackbar(`Successfully updated RNS for ${ip?.address}`, {
        variant: 'success',
      });
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      reset();
      formik.resetForm();
    }
  }, [open]);

  const errorMap = getErrorMap(['rdns'], error);

  return (
    <Drawer open={open} onClose={onClose} title="Edit Reverse DNS">
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && <Notice error>{errorMap.none}</Notice>}
        <TextField
          placeholder="Enter a domain name"
          label="Enter a domain name"
          hideLabel
          value={formik.values.rdns}
          errorText={errorMap.rdns}
          name="rdns"
          onChange={formik.handleChange}
          data-qa-domain-name
        />
        <Typography variant="body1">
          Leave this field blank to reset RDNS
        </Typography>
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            buttonType="secondary"
            className="cancel"
            onClick={onClose}
            data-qa-cancel
          >
            Close
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={isLoading}
            data-qa-submit
          >
            Save
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
