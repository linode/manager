import * as React from 'react';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    '&:last-of-type': {
      marginBottom: 0,
    },
    '&:last-of-type + hr': {
      display: 'none',
    },
  },
  switch: {
    display: 'flex',
    marginLeft: -12,
    width: 240,
    '& .toggleLabel': {
      display: 'flex',
      flexDirection: 'row',
      '& > span:first-child': {
        marginTop: -6,
      },
      '& > span:last-child': {
        ...theme.typography.h3,
      },
    },
  },
  copy: {
    marginTop: 40,
    marginLeft: -160,
    width: 600,
    [theme.breakpoints.down('sm')]: {
      marginTop: -28,
      marginLeft: 70,
      width: '100%',
    },
  },
  usageWrapper: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 70,
      width: '100%',
    },
  },
  usage: {
    animation: '$fadeIn .3s ease-in-out forwards',
    marginTop: 0,
    maxWidth: 150,
  },
}));

interface Props {
  title: string;
  textTitle: string;
  radioInputLabel: string;
  textInputLabel: string;
  copy: string;
  state: boolean;
  value: number;
  onStateChange: (e: React.ChangeEvent<{}>, checked: boolean) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  endAdornment: string;
  readOnly?: boolean;
}

type CombinedProps = Props;

export const AlertSection: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    title,
    textTitle,
    copy,
    state,
    value,
    onStateChange,
    onValueChange,
    error,
    endAdornment,
    readOnly,
  } = props;

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        className={classes.root}
        data-qa-alerts-panel
      >
        <Grid item className={classes.switch}>
          <FormControlLabel
            className="toggleLabel"
            control={
              <Toggle
                checked={state}
                disabled={readOnly}
                onChange={onStateChange}
              />
            }
            label={title}
            data-qa-alert={title}
          />
        </Grid>
        <Grid item className={classes.copy}>
          <Typography>{copy}</Typography>
        </Grid>
        <Grid item className={`${classes.usageWrapper} py0`}>
          <TextField
            className={classes.usage}
            disabled={!state || readOnly}
            error={Boolean(error)}
            errorText={error}
            label={textTitle}
            min={0}
            max={Infinity}
            onChange={onValueChange}
            type="number"
            value={value}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{endAdornment}</InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};

export default compose<CombinedProps, any>(RenderGuard)(AlertSection);
