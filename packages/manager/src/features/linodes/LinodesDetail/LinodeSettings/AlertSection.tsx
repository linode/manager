import * as React from 'react';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputAdornment from 'src/components/core/InputAdornment';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'switch' | 'copy' | 'usage' | 'usageWrapper';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      position: 'relative',
      padding: `${theme.spacing(3)}px 0`,
      '&:last-of-type + hr': {
        display: 'none'
      },
      '& .toggleLabel > span:last-child': {
        position: 'absolute',
        left: `calc(58px + ${theme.spacing(2)}px)`,
        top: theme.spacing(3) + 16,
        ...theme.typography.h3,
        [theme.breakpoints.up('md')]: {
          top: theme.spacing(3) + 8,
          left: `calc(58px + ${theme.spacing(4)}px)`
        }
      }
    },
    switch: {
      width: 50,
      padding: '2px 0 !important'
    },
    copy: {
      [theme.breakpoints.down('sm')]: {
        flexBasis: '100%'
      },
      [theme.breakpoints.up('md')]: {
        margin: `24px ${theme.spacing(3) + 8}px 0`
      },
      [theme.breakpoints.up('lg')]: {
        width: 600
      }
    },
    usageWrapper: {
      [theme.breakpoints.down('md')]: {
        width: '100%',
        marginTop: theme.spacing(2)
      }
    },
    usage: {
      animation: '$fadeIn .3s ease-in-out forwards',
      marginTop: 0,
      maxWidth: 150
    }
  });

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

type CombinedProps = Props & WithStyles<ClassNames>;

class AlertSection extends React.Component<CombinedProps> {
  render() {
    const { classes, readOnly } = this.props;

    return (
      <React.Fragment>
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
                  checked={this.props.state}
                  onChange={this.props.onStateChange}
                  disabled={readOnly}
                />
              }
              label={this.props.title}
              data-qa-alert={this.props.title}
            />
          </Grid>
          <Grid item className={classes.copy}>
            <Typography>{this.props.copy}</Typography>
          </Grid>
          <Grid item className={`${classes.usageWrapper} py0`}>
            <TextField
              label={this.props.textTitle}
              type="number"
              value={this.props.value}
              min={0}
              max={Infinity}
              disabled={!this.props.state || readOnly}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {this.props.endAdornment}
                  </InputAdornment>
                )
              }}
              error={Boolean(this.props.error)}
              errorText={this.props.error}
              onChange={this.props.onValueChange}
              className={classes.usage}
            />
          </Grid>
        </Grid>
        <Divider />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, any>(
  RenderGuard,
  styled
)(AlertSection);
