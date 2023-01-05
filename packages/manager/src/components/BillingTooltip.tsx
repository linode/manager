import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import ToolTip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { akamaiBillingInvoiceText } from 'src/features/Billing/billingUtils';

interface Props {
  text: string;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    padding: `4 4 0 4`,
    backgroundColor: 'transparent',
    transition: theme.transitions.create(['background-color']),
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    borderBottom: `1px dotted ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
}));

export const BillingTooltip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { text } = props;

  return (
    <ToolTip
      title={akamaiBillingInvoiceText}
      placement="bottom"
      className={classes.root}
    >
      <Typography>{text}</Typography>
    </ToolTip>
  );
};

export default BillingTooltip;
