import { update } from 'ramda';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  addIP: {
    left: -theme.spacing(2) + 3
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
    idx: number,
    currentIPs: string[]
  ) => {
    const transferIPs = update(idx, e.target.value, currentIPs);
    onChange(transferIPs);
  };

  const addNewInput = () => {
    onChange([...ips, '']);
  };

  if (!ips) {
    return null;
  }

  // Make sure there's at least one blank field
  const _ips = ips.length > 0 ? ips : [''];

  return (
    <>
      {_ips.map((thisIP, idx) => (
        <TextField
          key={`domain-transfer-ip-${idx}`}
          // Prevent unique ID errors, since the underlying abstraction sets the input element's ID to the label
          label={`Domain Transfer IP Address${idx > 0 ? ' ' + (idx + 1) : ''}`}
          errorText={error}
          value={thisIP}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(e, idx, _ips)
          }
        />
      ))}
      <AddNewLink
        onClick={addNewInput}
        label="Add IP"
        data-qa-add-domain-transfer-ip-field
        className={classes.addIP}
      />
    </>
  );
};

export default React.memo(DomainTransferInput);
