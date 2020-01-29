import { update } from 'ramda';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  addIP: {
    left: -theme.spacing(2) + 3
  },
  input: {
    marginTop: theme.spacing()
  },
  root: {
    marginTop: theme.spacing()
  }
}));

interface Props {
  error?: string;
  ips: string[];
  onChange: (ips: string[]) => void;
}

export const DomainTransferInput: React.FC<Props> = props => {
  const { error, onChange, ips } = props;
  const classes = useStyles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const transferIPs = update(idx, e.target.value, ips);
    onChange(transferIPs);
  };

  const addNewInput = () => {
    onChange([...ips, '']);
  };

  if (!ips) {
    return null;
  }

  if (ips.length === 0) {
    // Consumer logic to determine initial state is tricky,
    // so we're handling it here. Basically if we're passed [],
    // turn it to [''] so we have a blank input ready to go.
    addNewInput();
  }

  return (
    <div className={classes.root}>
      <Typography variant="h3">Domain Transfer</Typography>
      <Typography>
        IP addresses that may perform a zone transfer for this Domain. This is
        potentially dangerous, and should be left empty unless you intend to use
        it.
      </Typography>
      {ips.map((thisIP, idx) => (
        <TextField
          key={`domain-transfer-ip-${idx}`}
          className={classes.input}
          // Prevent unique ID errors, since the underlying abstraction sets the input element's ID to the label
          label={`Domain Transfer IP Address-${idx}`}
          value={thisIP}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(e, idx)
          }
          hideLabel
        />
      ))}
      <AddNewLink
        onClick={addNewInput}
        label="Add IP"
        data-qa-add-domain-transfer-ip-field
        className={classes.addIP}
      />
    </div>
  );
};

export default React.memo(DomainTransferInput);
