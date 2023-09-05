import { IPAddress } from '@linode/api-v4/lib/networking';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLinodeIPMutation } from 'src/queries/linodes/networking';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  ip: IPAddress | undefined;
  onClose: () => void;
  open: boolean;
}

export const EditIPRDNSDrawer = (props: Props) => {
  const { ip, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
    mutateAsync: updateIP,
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
    <Drawer onClose={onClose} open={open} title="Edit Reverse DNS">
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && (
          <Notice variant="error">{errorMap.none}</Notice>
        )}
        <TextField
          data-qa-domain-name
          errorText={errorMap.rdns}
          hideLabel
          label="Enter a domain name"
          name="rdns"
          onChange={formik.handleChange}
          placeholder="Enter a domain name"
          value={formik.values.rdns}
        />
        <Typography variant="body1">
          Leave this field blank to reset RDNS
        </Typography>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'cancel', onClick: onClose }}
          style={{ marginTop: 16 }}
        />
      </form>
    </Drawer>
  );
};
