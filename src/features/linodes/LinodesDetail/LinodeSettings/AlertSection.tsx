import * as React from 'react';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputAdornment from 'src/components/core/InputAdornment';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'switch' | 'copy' | 'usage' | 'usageWrapper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    minHeight: theme.spacing.unit * 16,
    position: 'relative',
    padding: `${theme.spacing.unit * 3}px 0`,
    '&:last-of-type + hr': {
      display: 'none'
    },
    '& .toggleLabel > span:last-child': {
      position: 'absolute',
      left: `calc(58px + ${theme.spacing.unit * 4}px)`,
      top: theme.spacing.unit * 5,
      ...theme.typography.h3
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
      margin: `${theme.spacing.unit * 4}px ${theme.spacing.unit * 4}px 0`
    },
    [theme.breakpoints.up('lg')]: {
      width: 600
    }
  },
  usageWrapper: {
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  usage: {
    animation: 'fadeIn .3s ease-in-out forwards',
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
          <Grid item className={classes.usageWrapper}>
            <TextField
              label={this.props.textTitle}
              type="number"
              value={this.props.value}
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
