import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Button from 'src/components/Button';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames = 'root' | 'inner';

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
});

const styled = withStyles(styles, { withTheme: true });

type updateNodeBalancerData = 'label' | 'client_conn_throttle';

interface Props {
  error?: string;
  textFieldProps?: TextFieldProps;
  isExpansion?: boolean;
  expansionHeader?: string;
  actions?: (whichField: updateNodeBalancerData) => void;
  isSubmitting?: boolean;
  success?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ClientConnectionThrottlePanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    textFieldProps: {
      placeholder: '0',
    },
  };

  render() {
    const { actions, isExpansion, isSubmitting, expansionHeader,
      error, classes, success, textFieldProps } = this.props;

    return (
      <React.Fragment>
        {isExpansion // will either be an expandable panel that will save the settings or a card
          ? <ExpansionPanel
            defaultExpanded={true}
            success={success}
            heading={expansionHeader || 'Client Connection Throttle'}
          >
            <div className={classes.inner}>
              {error && <Notice text={error} error />}
              <TextField {...textFieldProps} />
            </div>
            {actions &&
              <ActionsPanel>
                <Button
                  onClick={() => actions('client_conn_throttle')}
                  variant="raised"
                  disabled={isSubmitting}
                  color="primary"
                  data-qa-label-save
                >
                  Save
            </Button>
              </ActionsPanel>
            }
          </ExpansionPanel>
          : <Paper className={classes.root} data-qa-label-header>
            <div className={classes.inner}>
              <Typography variant="title">Client Connection Throttle</Typography>
              <TextField type="number" {...textFieldProps} />
            </div>
          </Paper>
        }
      </React.Fragment>
    );
  }
}

export default styled<Props>(ClientConnectionThrottlePanel);
