import { FormikErrors, FormikProps } from 'formik';
import { compose } from 'ramda';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import withEnhancedValidation, { EnhancedValidationProps } from 'src/components/EnhancedValidation';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';
import { changeLinodeDiskPassword, getLinodeDisks } from 'src/services/linodes';
import { validateLinodeDiskPassword } from 'src/utilities/validateLinodeDiskPassword';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: string;
}

interface FormValues {
  disk: Item | null;
  password: string;
}

interface State {
  disksLoading: boolean;
  disks: Item[];
  disksError?: string;
  diskId?: number;
}

type CombinedProps = Props
  & FormikProps<FormValues>
  & WithStyles<ClassNames>
  & EnhancedValidationProps;

class LinodeSettingsPasswordPanel extends React.Component<CombinedProps, State> {

  state: State = {
    disksLoading: true,
    disks: [],
  }

  renderExpansionActions = () => {
    const { isSubmitting, linodeStatus, handleFormSubmission } = this.props;

    return (
      <ActionsPanel>
        <Button
          type="primary"
          onClick={handleFormSubmission}
          loading={isSubmitting}
          disabled={linodeStatus !== 'offline' || isSubmitting}
          data-qa-password-save
          tooltipText={
            linodeStatus !== 'offline'
              ?
              'Your Linode must be fully powered down in order to change your root password'
              : ''
          }
        >
          Save
        </Button>
      </ActionsPanel>
    );
  }

  searchDisks = (value: string = '') => {
    if (this.state.disksLoading === false) {
      this.setState({ disksLoading: true });
    }

    return getLinodeDisks(this.props.linodeId, {}, { label: { '+contains': value } })
      .then(response => response.data
        .filter((disk: Linode.Disk) => disk.filesystem !== 'swap')
        .map(disk => ({
          value: disk.id,
          label: disk.label,
          data: disk,
        })))
      .then(disks => {
        this.setState({ disks, disksLoading: false })

        /** TLDR; If we only have one disk we set that to state after the disks have been set */
        if (disks.length === 1) {
          this.handleDiskSelection(disks[0]);
        }
      })
      .catch(_ => this.setState({ disksError: 'An error occurred while searching for disks.', disksLoading: false }))
  };

  debouncedSearch = debounce(400, false, this.searchDisks);

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') { return; }
    this.setState({ disksLoading: true });
    this.debouncedSearch(inputValue);
  }

  handleDiskSelection = (selected: Item) => {
    if (selected) {
      this.props.setFieldValue('disk', selected);
      return this.setState({ diskId: Number(selected.value) });
    }

    return this.setState({ diskId: undefined });
  };

  handlePanelChange = (e: React.ChangeEvent<{}>, open: boolean) => {
    if (open) {
      this.searchDisks();
    }
  };

  render() {
    const { disks, disksError, disksLoading } = this.state;

    const {
      handleBlur,
      handleSelectFieldChange,
      handleTextFieldChange,
      maybeGetErrorText,
      status,
      values
    } = this.props;

    return (
      <ExpansionPanel
        heading="Reset Root Password"
        success={status && status.success && status.message}
        actions={this.renderExpansionActions}
        onChange={this.handlePanelChange}
      >
        {status && !status.success &&
          <Notice text={status.message} error />
        }

        <EnhancedSelect
          label="Disk"
          placeholder="Find a Disk"
          name="disk"
          isLoading={disksLoading}
          errorText={maybeGetErrorText('disk') || disksError}
          options={disks}
          onChange={(selectedItem: Item) => handleSelectFieldChange(selectedItem, 'disk')}
          onBlur={handleBlur}
          onInputChange={this.onInputChange}
          value={values.disk || null}
          data-qa-select-linode
        />

        <PasswordInput
          label="Password"
          name="password"
          value={values.password}
          onChange={handleTextFieldChange}
          onBlur={handleBlur}
          errorText={maybeGetErrorText('password')}
          errorGroup="linode-settings-password"
          error={!!maybeGetErrorText('password')}
        />
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

const mapPropsToValues = (props: Props) => {
  return {
    disk: null,
    password: ''
  }
};

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.disk) {
    errors.disk = 'Please select a disk';
  }

  const passwordValidationResponse = validateLinodeDiskPassword(values.password);
  if (!passwordValidationResponse.isValid) {
    errors.password = passwordValidationResponse.message;
  }

  return errors;
}

const successMessage = 'Linode disk password reset successfully';

const request = (ownProps: any) => changeLinodeDiskPassword(
    ownProps.linodeId,
    ownProps.values.disk.value,
    ownProps.values.password)
  .then(response => response);

const validated = withEnhancedValidation(
  mapPropsToValues,
  validate,
  request,
  successMessage
);

export default compose(
  errorBoundary,
  styled,
  validated
)(LinodeSettingsPasswordPanel) as React.ComponentType<Props>;