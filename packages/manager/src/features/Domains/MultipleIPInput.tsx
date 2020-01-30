import Close from '@material-ui/icons/Close';
import { update } from 'ramda';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  addIP: {
    left: -theme.spacing(2) + 3
  },
  input: {
    marginBottom: theme.spacing()
  },
  root: {
    marginTop: theme.spacing()
  },
  button: {
    minWidth: 'auto',
    minHeight: 'auto',
    marginBottom: theme.spacing(),
    marginLeft: -theme.spacing(),
    padding: 0,
    '& > span': {
      padding: 2
    },
    '& :hover, & :focus': {
      color: 'white',
      backgroundColor: theme.palette.primary.main
    }
  }
}));

interface Props {
  title: string;
  helperText?: string;
  error?: string;
  ips: string[];
  onChange: (ips: string[]) => void;
}

export const MultipleIPInput: React.FC<Props> = props => {
  const { error, onChange, ips, title, helperText } = props;
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

  const removeInput = (idx: number) => {
    const _ips = [...ips];
    _ips.splice(idx, 1);
    onChange(_ips);
  };

  if (!ips) {
    return null;
  }

  if (ips.length === 0) {
    // Consumer logic to determine initial state is tricky,
    // so we're handling it here. Basically if we're passed [],
    // transform it to [''] so we have a blank input ready to go.
    addNewInput();
  }

  return (
    <div className={classes.root}>
      <Typography variant="h3">{title}</Typography>
      {helperText && <Typography>{helperText}</Typography>}
      {error && <Notice error text={error} spacingTop={8} />}
      {ips.map((thisIP, idx) => (
        <Grid
          container
          key={`domain-transfer-ip-${idx}`}
          direction="row"
          alignItems="center"
          justify="center"
        >
          <Grid item xs={11}>
            <TextField
              className={classes.input}
              // Prevent unique ID errors, since TextField sets the input element's ID to the label
              label={`domain-transfer-ip-${idx}`}
              InputProps={{ 'aria-label': `${title} ip-address-${idx}` }}
              value={thisIP}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, idx)
              }
              hideLabel
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              className={classes.button}
              onClick={() => removeInput(idx)}
              // Disable this if the value is empty and it's the only input,
              // since in that case clicking delete won't do anything.
              disabled={ips.length === 1 && thisIP === ''}
            >
              <Close />
            </Button>
          </Grid>
        </Grid>
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

export default React.memo(MultipleIPInput);
