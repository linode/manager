import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Button from 'src/components/Button';
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
    margin: `
      ${theme.spacing.unit * 4}px
      ${theme.spacing.unit}px
      ${0}
      -${theme.spacing.unit}px
    `,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface ExpansionPanelProps {
  expansionHeader?: string;
  action?: () => void;
  isSubmitting: boolean;
  success: string | undefined;
}

interface Props {
  error?: string;
  textFieldProps?: TextFieldProps;
  expansion?: ExpansionPanelProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ClientConnectionThrottlePanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    textFieldProps: {
      placeholder: '0',
    },
  };

  render() {
    const { expansion, error, classes, textFieldProps } = this.props;

    return (
      <React.Fragment>
        {!!expansion // will either be an expandable panel that will save the settings or a card
          ? <ExpansionPanel
            defaultExpanded={true}
            success={expansion.success}
            heading={expansion.expansionHeader || 'Client Connection Throttle'}
          >
            <div className={!expansion ? classes.inner : ''}>
              {error && <Notice text={error} error />}
              <TextField {...textFieldProps} />
            </div>
            {expansion.action &&
              <ActionsPanel className={expansion ? classes.expPanelButton : ''}>
                <Button
                  onClick={() => expansion.action!}
                  variant="raised"
                  disabled={expansion.isSubmitting}
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
