import { IPRange } from '@linode/api-v4/lib/networking';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllIPsQuery,
  useLinodeIPMutation,
} from 'src/queries/linodes/networking';
import { getErrorMap } from 'src/utilities/errorUtils';

import { listIPv6InRange } from './LinodeIPAddresses';

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
    isLoading,
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
      enqueueSnackbar(`Successfully updated RNS for ${range?.range}`, {
        variant: 'success',
      });
      onClose();
    },
  });

  const theme = useTheme();

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  const errorMap = getErrorMap(['rdns'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Edit Reverse DNS">
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && (
          <Notice data-qa-error variant="error" style={{ marginTop: 16 }}>
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
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Close',
            onClick: onClose,
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
            <div style={{ marginTop: theme.spacing(2) }} key={ip.address}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
