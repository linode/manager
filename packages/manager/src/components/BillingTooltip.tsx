import * as React from 'react';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import ToolTip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';

interface Props {
  text: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    padding: 4,
    borderRadius: 4,
    cursor: 'pointer',
    textDecoration: `underline dotted ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
  popper: {
    '& .MuiTooltip-tooltip': {
      minWidth: 375,
    },
  },
}));

const akamaiBillingInvoiceText = (
  <Typography>
    Charges in the final Akamai invoice should be considered the final source
    truth. Linode invoice will not reflect discounting, currency adjustment, or
    any negotiated terms and conditions. Condensed and finalized invoice is
    available within{' '}
    <Link to="https://control.akamai.com/apps/billing">
      Akamai Control Center &gt; Billing <ExternalLinkIcon />
    </Link>
    .
  </Typography>
);

export const BillingTooltip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { text } = props;

  return (
    <ToolTip
      title={akamaiBillingInvoiceText}
      placement="bottom"
      className={classes.root}
      classes={{ popper: classes.popper }}
    >
      <Typography>{text}</Typography>
    </ToolTip>
  );
};

export default BillingTooltip;
