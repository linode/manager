import {
  Box,
  Divider,
  fadeIn,
  FormControlLabel,
  InputAdornment,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

interface Props {
  copy: string;
  endAdornment: string;
  error?: string;
  onStateChange: (e: React.ChangeEvent<{}>, checked: boolean) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  radioInputLabel: string;
  readOnly?: boolean;
  state: boolean;
  textInputLabel: string;
  textTitle: string;
  title: string;
  value: number;
}

export const AlertSection = (props: Props) => {
  const theme = useTheme();
  const {
    copy,
    endAdornment,
    error,
    onStateChange,
    onValueChange,
    readOnly,
    state,
    textTitle,
    title,
    value,
  } = props;

  return (
    <>
      <Grid
        container
        data-qa-alerts-panel
        spacing={2}
        sx={{
          '&:last-of-type': {
            marginBottom: 0,
          },
          '&:last-of-type + hr': {
            display: 'none',
          },
          alignItems: 'flex-start',
          flex: 1,
          marginBottom: theme.spacing(2),
        }}
      >
        <Grid
          size={{
            lg: 7,
            md: 9,
            xs: 12,
          }}
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
              data-qa-alert={title}
              label={title}
              sx={{
                '& > span:last-child': {
                  ...theme.typography.h3,
                },
                '.MuiFormControlLabel-label': {
                  paddingLeft: '12px',
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
          size={{
            lg: 5,
            md: 3,
            xs: 12,
          }}
          sx={{
            paddingBottom: '0',
            paddingTop: '0',
            [theme.breakpoints.down('md')]: {
              paddingLeft: '78px',
            },
          }}
        >
          <TextField
            disabled={!state || readOnly}
            error={Boolean(error)}
            errorText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{endAdornment}</InputAdornment>
              ),
            }}
            label={textTitle}
            max={Infinity}
            min={0}
            onChange={onValueChange}
            sx={{
              '.MuiInput-root': {
                animation: `${fadeIn} .3s ease-in-out forwards`,
                marginTop: 0,
                maxWidth: 150,
              },
            }}
            type="number"
            value={value}
          />
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};
