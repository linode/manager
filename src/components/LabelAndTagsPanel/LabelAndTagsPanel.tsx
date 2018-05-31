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
      -${theme.spacing.unit * 2}px
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
  labelFieldProps?: TextFieldProps;
  expansion?: ExpansionPanelProps;
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
    const { classes, error, labelFieldProps, expansion } = this.props;

    return (
      <React.Fragment>
        {!!expansion // will either be an expandable panel that will save the settings or a card
          ? <ExpansionPanel
            defaultExpanded={true}
            success={expansion.success}
            heading={expansion.expansionHeader || 'Label'}
          >
            <div className={!expansion ? classes.inner : ''}>
              {error && <Notice text={error} error />}
              <TextField {...labelFieldProps} />
            </div>
            {!!expansion.action &&
              <ActionsPanel className={expansion ? classes.expPanelButton : ''}>
                <Button
                  onClick={expansion.action}
                  type="primary"
                  disabled={expansion.isSubmitting}
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
