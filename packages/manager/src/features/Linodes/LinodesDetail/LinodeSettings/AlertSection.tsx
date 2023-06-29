import * as React from 'react';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputAdornment from 'src/components/core/InputAdornment';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { useTheme } from '@mui/material/styles';
import { fadeIn } from 'src/styles/keyframes';

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

export const AlertSection = (props: Props) => {
  const theme = useTheme();
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
        data-qa-alerts-panel
        spacing={2}
        sx={{
          alignItems: 'flex-start',
          flex: 1,
          marginBottom: theme.spacing(2),
          '&:last-of-type': {
            marginBottom: 0,
          },
          '&:last-of-type + hr': {
            display: 'none',
          },
        }}
      >
        <Grid
          xs={12}
          md={9}
          lg={7}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box>
            <FormControlLabel
              control={
                <Toggle
                  checked={state}
                  disabled={readOnly}
                  onChange={onStateChange}
                />
              }
              label={title}
              data-qa-alert={title}
              sx={{
                '.MuiFormControlLabel-label': {
                  paddingLeft: '12px',
                },
                '& > span:last-child': {
                  ...theme.typography.h3,
                },
              }}
            />
          </Box>
          <Box
            sx={{
              paddingLeft: '70px',
              [theme.breakpoints.down('md')]: {
                marginTop: '-12px',
              },
            }}
          >
            <Typography>{copy}</Typography>
          </Box>
        </Grid>
        <Grid
          xs={12}
          md={3}
          lg={5}
          sx={{
            paddingTop: '0',
            paddingBottom: '0',
            [theme.breakpoints.down('md')]: {
              paddingLeft: '78px',
            },
          }}
        >
          <TextField
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
            sx={{
              '.MuiInput-root': {
                animation: `${fadeIn} .3s ease-in-out forwards`,
                marginTop: 0,
                maxWidth: 150,
              },
            }}
          />
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};
