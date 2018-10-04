import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Select, { NoOptionsMessageProps } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import { TagObject } from 'src/features/linodes/LinodesCreate/tagsHoc';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';


type ClassNames = 'root'
  | 'inner'
  | 'expPanelButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
  tagObject?: TagObject;
  tagError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class InfoPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    labelFieldProps: {
      label: 'Label',
      placeholder: 'Enter a Label',
    },
  };

  getEmptyMessage = (value:NoOptionsMessageProps) => {
    const { getLinodeTagList } = this.props.tagObject!.actions;
    const tags = getLinodeTagList();
    if (tags.includes(value.inputValue)) { return 'This tag is already selected.'}
    else { return "No results." }
  }

  renderTagsPanel = () => {
    if (!this.props.tagObject) { return; }
    const { accountTags, actions, errors, selectedTags } = this.props.tagObject;
    const hasErrorFor = getAPIErrorFor({ label: 'label' }, errors);
    // Label refers to the tag label, not the Linode label
    const labelError = hasErrorFor('label');
    const generalError = hasErrorFor('none');
    const { tagError } = this.props;
    return (
      <Select
        variant='creatable'
        isMulti={true}
        label={"Add Tags"}
        options={accountTags}
        placeholder={"Type to choose or create a tag."}
        errorText={labelError || tagError || generalError}
        value={selectedTags}
        onChange={actions.addTag}
        createNew={actions.createTag}
        noOptionsMessage={this.getEmptyMessage}
      />
    )
  }

  render() {
    const { classes, error, labelFieldProps, isForm, tagObject } = this.props;

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
              {tagObject && this.renderTagsPanel()}
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
              {tagObject && this.renderTagsPanel()}
            </div>
          </Paper>
        }
      </React.Fragment>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(InfoPanel));
