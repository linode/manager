import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames = 'root'
| 'inner'
| 'expPanelButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  expPanelButton: {
    padding: 0,
    marginTop: theme.spacing.unit * 2,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface IsFormProps {
  action?: () => void;
  isSubmitting: boolean;
  success: string | undefined;
}

interface Props {
  error?: string;
  textFieldProps?: TextFieldProps;
  isForm?: IsFormProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ClientConnectionThrottlePanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    textFieldProps: {
      placeholder: '0',
    },
  };

  render() {
    const { isForm, error, classes, textFieldProps } = this.props;

    return (
      <React.Fragment>
        {!!isForm // will either be an expandable panel that will save the settings or a card
          ? <Paper style={{ padding: 24, marginTop: 24 }}>
              <Grid xs={12}>
                {isForm.success &&
                  <Notice
                    success
                    text={isForm.success}
                  />
                }
              </Grid>
              <Typography variant="title">Client Connection Throttle</Typography>
              <div className={!isForm ? classes.inner : ''}>
                {error && <Notice text={error} error />}
                <TextField data-qa-connection-throttle {...textFieldProps} />
              </div>
              {isForm.action &&
                <ActionsPanel className={isForm ? classes.expPanelButton : ''}>
                  <Button
                    onClick={isForm.action}
                    disabled={isForm.isSubmitting}
                    type="primary"
                    data-qa-label-save
                  >
                    Save
                  </Button>
                </ActionsPanel>
              }
            </Paper>
          : <Paper className={classes.root} data-qa-throttle-section>
            <div className={classes.inner}>
              <Typography variant="title">Client Connection Throttle</Typography>
              <TextField
                type="number"
                data-qa-connection-throttle
                {...textFieldProps}
              />
            </div>
          </Paper>
        }
      </React.Fragment>
    );
  }
}

export default styled<Props>(ClientConnectionThrottlePanel);
