import {
  Box,
  Divider,
  InputAdornment,
  TextField,
  Toggle,
  Typography,
  fadeIn,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';

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
        container
        data-qa-alerts-panel
        spacing={2}
      >
        <Grid
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
          lg={7}
          md={9}
          xs={12}
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
              sx={{
                '& > span:last-child': {
                  ...theme.typography.h3,
                },
                '.MuiFormControlLabel-label': {
                  paddingLeft: '12px',
                },
              }}
              data-qa-alert={title}
              label={title}
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
          sx={{
            paddingBottom: '0',
            paddingTop: '0',
            [theme.breakpoints.down('md')]: {
              paddingLeft: '78px',
            },
          }}
          lg={5}
          md={3}
          xs={12}
        >
          <TextField
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
            disabled={!state || readOnly}
            error={Boolean(error)}
            errorText={error}
            label={textTitle}
            max={Infinity}
            min={0}
            onChange={onValueChange}
            type="number"
            value={value}
          />
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};
