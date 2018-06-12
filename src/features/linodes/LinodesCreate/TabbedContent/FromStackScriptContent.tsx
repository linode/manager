import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import SelectImagePanel from '../SelectImagePanel';
import PasswordPanel from '../PasswordPanel';
import AddonsPanel from '../AddonsPanel';
import { StateToUpdate as FormState } from '../LinodesCreate';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import Notice from 'src/components/Notice';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';

import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

interface Props {
  errors?: Linode.ApiFieldError[];
  notice?: Notice;
  updateFormState: (stateToUpdate: FormState[]) => void;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  selectedStackScriptID: number | null;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  backups: boolean;
  privateIP: boolean;
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  label: string | null;
  password: string | null;
  udf_data: any;
}

interface State {
  userDefinedFields: Linode.StackScript.UserDefinedField[];
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

type CombinedProps = Props & WithStyles<ClassNames>;

export class FromStackScriptContent extends React.Component<CombinedProps, State> {
  state: State = {
    userDefinedFields: mockUserDefinedFields,
  };

  componentDidMount() {
    // add fields with default values to formState here
    const { userDefinedFields } = this.state;
    const { updateFormState } = this.props;
    const defaultUDFData = {};
    userDefinedFields.forEach((eachField) => {
      if (!!eachField.default) {
        defaultUDFData[eachField.name] = eachField.default;
      }
    });
    updateFormState([{
      stateKey: 'udf_data',
      newValue: defaultUDFData,
    }]);
  }

  render() {
    const { notice, errors, backups, privateIP, updateFormState,
      getBackupsMonthlyPrice, label, images, regions, selectedImageID,
      selectedRegionID, selectedStackScriptID, selectedTypeID, password, types } = this.props;

    const { userDefinedFields } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {notice &&
          <Notice
            text={notice.text}
            error={(notice.level) === 'error'}
            warning={(notice.level === 'warning')}
          />
        }
        {generalError &&
          <Notice text={generalError} error={true} />
        }
        <SelectStackScriptPanel
          selectedId={selectedStackScriptID}
          shrinkPanel={true}
          updateFor={[selectedStackScriptID]}
          onSelect={(id: number) => {
            updateFormState([{ stateKey: 'selectedStackScriptID', newValue: id }]);
          }}
        />
        <UserDefinedFieldsPanel
          updateFormState={updateFormState}
          userDefinedFields={userDefinedFields}
          udf_data={this.props.udf_data}
        />
        <SelectImagePanel
          images={images}
          handleSelection={(id: string) =>
            updateFormState([{ stateKey: 'selectedImageID', newValue: id }])}
          selectedImageID={selectedImageID}
        />
        <SelectRegionPanel
          error={hasErrorFor('region')}
          regions={regions}
          handleSelection={(id: string) =>
            updateFormState([{ stateKey: 'selectedRegionID', newValue: id }])}
          selectedID={selectedRegionID}
          copy="Determine the best location for your Linode."
        />
        <SelectPlanPanel
          error={hasErrorFor('type')}
          types={types}
          onSelect={(id: string) =>
            updateFormState([{ stateKey: 'selectedTypeID', newValue: id }])}
          selectedID={selectedTypeID}
        />
        <LabelAndTagsPanel
          labelFieldProps={{
            label: 'Linode Label',
            value: label || '',
            onChange: e =>
              updateFormState([{ stateKey: 'label', newValue: e.target.value }]),
            errorText: hasErrorFor('label'),
          }}
        />
        <PasswordPanel
          error={hasErrorFor('root_pass')}
          password={password}
          handleChange={v =>
            updateFormState([{ stateKey: 'password', newValue: v }])}
        />
        <AddonsPanel
          backups={backups}
          backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
          privateIP={privateIP}
          changeBackups={() =>
            updateFormState([{ stateKey: 'backups', newValue: !backups }])}
          changePrivateIP={() =>
            updateFormState([{ stateKey: 'privateIP', newValue: !privateIP }])}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(FromStackScriptContent);

