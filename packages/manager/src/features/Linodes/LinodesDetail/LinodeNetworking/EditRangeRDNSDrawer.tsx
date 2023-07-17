import { IPRange } from '@linode/api-v4/lib/networking';
import { Theme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllIPsQuery,
  useLinodeIPMutation,
} from 'src/queries/linodes/networking';
import { getErrorMap } from 'src/utilities/errorUtils';

import { listIPv6InRange } from './LinodeNetworking';

const useStyles = makeStyles()((theme: Theme) => ({
  header: {
    marginTop: theme.spacing(2),
  },
  ipv6Input: {
    marginBottom: theme.spacing(2),
  },
  rdnsRecord: {
    marginTop: theme.spacing(2),
  },
  section: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(2),
  },
}));

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

  const { classes } = useStyles();

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
          <Notice data-qa-error error style={{ marginTop: 16 }}>
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
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            buttonType="secondary"
            className="cancel"
            data-qa-cancel
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            buttonType="primary"
            data-qa-submit
            loading={isLoading}
            type="submit"
          >
            Save
          </Button>
        </ActionsPanel>
      </form>
      {range && ips && ips.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.header} variant="h3">
            Existing Records
          </Typography>
          {ips.map((ip) => (
            <div className={classes.rdnsRecord} key={ip.address}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
