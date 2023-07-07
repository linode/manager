import { IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Drawer from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import {
  useAllIPsQuery,
  useLinodeIPMutation,
} from 'src/queries/linodes/networking';
import { Notice } from 'src/components/Notice/Notice';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { listIPv6InRange } from './LinodeNetworking';

const useStyles = makeStyles()((theme: Theme) => ({
  section: {
    marginTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  header: {
    marginTop: theme.spacing(2),
  },
  rdnsRecord: {
    marginTop: theme.spacing(2),
  },
  ipv6Input: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  range: IPRange | undefined;
  linodeId: number;
}

export const EditRangeRDNSDrawer = (props: Props) => {
  const { open, onClose, range, linodeId } = props;
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
    mutateAsync: updateIP,
    isLoading,
    error,
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

  const { classes } = useStyles();

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  const errorMap = getErrorMap(['rdns'], error);

  return (
    <Drawer open={open} onClose={onClose} title="Edit Reverse DNS">
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && (
          <Notice error style={{ marginTop: 16 }} data-qa-error>
            {errorMap.none}
          </Notice>
        )}
        <TextField
          placeholder="Enter an IPv6 address"
          label="Enter an IPv6 address"
          value={formik.values.address}
          onChange={formik.handleChange}
          name="address"
          data-qa-address-name
        />
        <TextField
          placeholder="Enter a domain name"
          label="Enter a domain name"
          value={formik.values.rdns}
          errorText={errorMap.rdns}
          name="rdns"
          onChange={formik.handleChange}
          data-qa-domain-name
        />
        <Typography variant="body1">
          Leave this field blank to reset RDNS
        </Typography>
        <ActionsPanel
          primary
          primaryButtonDataTestId="submit"
          primaryButtonLoading={isLoading}
          primaryButtonText="Save"
          primaryButtonType="submit"
          secondary
          secondaryButtonDataTestId="cancel"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Close"
          style={{ marginTop: 16 }}
        />
      </form>
      {range && ips && ips.length > 0 && (
        <div className={classes.section}>
          <Typography variant="h3" className={classes.header}>
            Existing Records
          </Typography>
          {ips.map((ip) => (
            <div key={ip.address} className={classes.rdnsRecord}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
