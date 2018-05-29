import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import Notice from 'src/components/Notice';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Button from 'src/components/Button';
import ActionsPanel from 'src/components/ActionsPanel';

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

type updateNodeBalancerData = 'label' | 'client_conn_throttle';

interface Props {
  error?: string;
  labelFieldProps?: TextFieldProps;
  isExpansion?: boolean;
  expansionHeader?: string;
  actions?: (whichField: updateNodeBalancerData) => void;
  isSubmitting?: boolean;
  success?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class InfoPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    labelFieldProps: {
      label: 'Label',
      placeholder: 'Enter a Label',
    },
  };

  render() {
    const { actions, isExpansion, isSubmitting, expansionHeader,
       classes, error, success, labelFieldProps } = this.props;

    return (
      <React.Fragment>
        {isExpansion // will either be an expandable panel that will save the settings or a card
          ? <ExpansionPanel
            defaultExpanded={true}
            success={success}
            heading={expansionHeader || 'Label'}
          >
            <div className={!isExpansion ? classes.inner : ''}>
              {error && <Notice text={error} error />}
              <TextField {...labelFieldProps} />
            </div>
            {actions &&
              <ActionsPanel className={isExpansion ? classes.expPanelButton : ''}>
                <Button
                  variant="raised"
                  onClick={() => actions('label')}
                  color="primary"
                  disabled={isSubmitting}
                  data-qa-label-save
                >
                  Save
              </Button>
              </ActionsPanel>
            }
          </ExpansionPanel>
          : <Paper className={classes.root} data-qa-label-header>
            <div className={classes.inner}>
              {error && <Notice text={error} error />}
              <Typography variant="title">Label</Typography>
              <TextField {...labelFieldProps} />
            </div>
          </Paper>
        }
      </React.Fragment>
    );
  }
}

export default styled<Props>(InfoPanel);
