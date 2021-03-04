// @todo: this import?
import { InputBaseProps } from '@material-ui/core/InputBase';
import Close from '@material-ui/icons/Close';
import * as classnames from 'classnames';
import * as React from 'react';
import Info from 'src/assets/icons/info.svg';
import Button from 'src/components/Button';
import IconButton from 'src/components/core/IconButton';
import InputLabel from 'src/components/core/InputLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { ExtendedIP } from 'src/utilities/ipUtils';

const useStyles = makeStyles((theme: Theme) => ({
  addIP: {
    paddingLeft: 0,
    paddingTop: theme.spacing(1.5),
    '& span:first-of-type': {
      justifyContent: 'flex-start',
    },
  },
  input: {
    'nth-child(n+2)': {
      marginTop: theme.spacing(),
    },
  },
  root: {
    marginTop: theme.spacing(),
  },
  button: {
    minWidth: 'auto',
    minHeight: 'auto',
    marginLeft: -theme.spacing(),
    padding: 0,
    '& > span': {
      padding: 2,
    },
    '& :hover, & :focus': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    },
  },
  helperText: {
    marginBottom: theme.spacing(),
  },
  ipNetmaskTooltipSection: {
    display: 'flex',
    flexDirection: 'row',
  },
  infoIcon: {
    paddingTop: 0,
  },
}));

export interface Props {
  title: string;
  helperText?: string;
  tooltip?: string;
  placeholder?: string;
  error?: string;
  ips: ExtendedIP[];
  onChange: (ips: ExtendedIP[]) => void;
  onBlur?: (ips: ExtendedIP[]) => void;
  inputProps?: InputBaseProps;
  className?: string;
}

export const MultipleIPInput: React.FC<Props> = (props) => {
  const {
    error,
    onChange,
    onBlur,
    ips,
    title,
    helperText,
    tooltip,
    placeholder,
  } = props;
  const classes = useStyles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const newIPs = [...ips];
    newIPs[idx].address = e.target.value;
    onChange(newIPs);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    idx: number
  ) => {
    if (!onBlur) {
      return;
    }

    const newIPs = [...ips];
    newIPs[idx].address = e.target.value;
    onBlur(newIPs);
  };

  const addNewInput = () => {
    onChange([...ips, { address: '' }]);
  };

  const removeInput = (idx: number) => {
    const _ips = [...ips];
    _ips.splice(idx, 1);
    onChange(_ips);
  };

  if (!ips) {
    return null;
  }

  return (
    <div
      className={classnames({
        [classes.root]: true,
        // Inject the className if given as as prop.
        [props.className ?? '']: Boolean(props.className),
      })}
    >
      {tooltip ? (
        <div className={classes.ipNetmaskTooltipSection}>
          <InputLabel>{title}</InputLabel>
          <Tooltip title={tooltip} placement="right">
            <IconButton className={classes.infoIcon}>
              <Info />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <InputLabel>{title}</InputLabel>
      )}
      {helperText && (
        <Typography className={classes.helperText}>{helperText}</Typography>
      )}
      {error && <Notice error text={error} spacingTop={8} />}
      {ips.map((thisIP, idx) => (
        <Grid
          container
          key={`domain-transfer-ip-${idx}`}
          direction="row"
          alignItems="center"
          justify="center"
          data-testid="domain-transfer-input"
        >
          <Grid item xs={11}>
            <TextField
              className={classes.input}
              // Prevent unique ID errors, since TextField sets the input element's ID to the label
              label={`domain-transfer-ip-${idx}`}
              InputProps={{
                'aria-label': `${title} ip-address-${idx}`,
                ...props.inputProps,
              }}
              value={thisIP.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, idx)
              }
              onBlur={(e) => handleBlur(e, idx)}
              errorText={thisIP.error}
              placeholder={placeholder}
              hideLabel
            />
          </Grid>
          {/** Don't show the button for the first input since it won't do anything */}
          <Grid item xs={1}>
            {idx > 0 && (
              <Button
                className={classes.button}
                onClick={() => removeInput(idx)}
              >
                <Close data-testid={`delete-ip-${idx}`} />
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
      <Button
        buttonType="secondary"
        superCompact
        onClick={addNewInput}
        className={classes.addIP}
      >
        Add an IP
      </Button>
    </div>
  );
};

export default React.memo(MultipleIPInput);
