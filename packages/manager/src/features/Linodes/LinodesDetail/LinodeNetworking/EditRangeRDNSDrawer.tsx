import {
  useAllIPsQuery,
  useLinodeIPMutation,
  useLinodeQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { getErrorMap } from 'src/utilities/errorUtils';

import { listIPv6InRange } from './LinodeIPAddressRow';

import type { IPRange } from '@linode/api-v4';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  range: IPRange | undefined;
}

export const EditRangeRDNSDrawer = (props: Props) => {
  const { linodeId, onClose, open, range } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { data: ipsInRegion } = useAllIPsQuery(
    {},
    {
      region: linode?.region,
    },
    range !== undefined && linode !== undefined && open
  );

  // @todo in the future use an API filter insted of `listIPv6InRange` ARB-3785
  const ips = range
    ? listIPv6InRange(range.range, range.prefix, ipsInRegion)
    : [];

  const {
    error,
    isPending,
    mutateAsync: updateIP,
    reset,
  } = useLinodeIPMutation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      address: range?.range,
      rdns: '',
    },
    async onSubmit(values) {
      await updateIP({
        address: values.address ?? '',
        rdns: values.rdns === '' ? null : values.rdns,
      });
      enqueueSnackbar(`Successfully updated RDNS for ${range?.range}`, {
        variant: 'success',
      });
      handleClose();
    },
  });

  const theme = useTheme();

  const handleClose = () => {
    formik.resetForm();
    reset();
    onClose();
  };

  const errorMap = getErrorMap(['rdns'], error);

  return (
    <Drawer onClose={handleClose} open={open} title="Edit Reverse DNS">
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && (
          <Notice data-qa-error style={{ marginTop: 16 }} variant="error">
            {errorMap.none}
          </Notice>
        )}
        <TextField
          data-qa-address-name
          label="Enter an IPv6 address"
          name="address"
          onChange={formik.handleChange}
          placeholder="Enter an IPv6 address"
          value={formik.values.address}
        />
        <TextField
          data-qa-domain-name
          errorText={errorMap.rdns}
          helperText="Leave this field blank to reset RDNS"
          label="Enter a domain name"
          name="rdns"
          onChange={formik.handleChange}
          placeholder="Enter a domain name"
          value={formik.values.rdns}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save',
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Close',
            onClick: handleClose,
          }}
          style={{ marginTop: 16 }}
        />
      </form>
      {range && ips && ips.length > 0 && (
        <div
          style={{
            borderTop: `1px solid ${theme.palette.divider}`,
            marginTop: theme.spacing(2),
          }}
        >
          <Typography sx={{ marginTop: theme.spacing(2) }} variant="h3">
            Existing Records
          </Typography>
          {ips.map((ip) => (
            <div key={ip.address} style={{ marginTop: theme.spacing(2) }}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
