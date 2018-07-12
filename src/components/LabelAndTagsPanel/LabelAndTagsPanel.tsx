import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
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
  labelFieldProps?: TextFieldProps;
  isForm?: IsFormProps;
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
    const { classes, error, labelFieldProps, isForm } = this.props;

    return (
      <React.Fragment>
        {!!isForm // will either be a form that will save the settings or a card
          ? <Paper style={{ padding: 24 }}>
              <Grid item xs={12}>
                {isForm.success &&
                  <Notice
                    success
                    text={isForm.success}
                  />
                }
              </Grid>
              <div className={!isForm ? classes.inner : ''}>
                {error && <Notice text={error} error />}
                <TextField data-qa-label-panel {...labelFieldProps} />
              </div>
              {!!isForm.action &&
                <ActionsPanel
                  className={isForm ? classes.expPanelButton : ''}
                >
                  <Button
                    onClick={isForm.action}
                    type="primary"
                    disabled={isForm.isSubmitting}
                    data-qa-label-save
                  >
                    Save
                </Button>
                </ActionsPanel>
              }
            </Paper>
          : <Paper className={classes.root} data-qa-label-header>
            <div className={classes.inner}>
              {error && <Notice text={error} error />}
              <TextField {...labelFieldProps} data-qa-label-input />
            </div>
          </Paper>
        }
      </React.Fragment>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(InfoPanel));
