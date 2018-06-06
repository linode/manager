import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import AddonsPanel from '../AddonsPanel';
import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
import { StateToUpdate as FormState } from '../LinodesCreate';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import Notice from 'src/components/Notice';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';


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
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  selectedLinodeID: number | undefined;
  selectedDiskSize: number | undefined;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  backups: boolean;
  privateIP: boolean;
  getBackupsMonthlyPrice: () => number | null;
  label: string | null;
  extendLinodes: (linodes: Linode.Linode[]) => ExtendedLinode[];
  linodes: Linode.Linode[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

const FromLinodeContent: React.StatelessComponent<CombinedProps> = (props) => {
  const { notice, errors, backups, privateIP, updateFormState,
    getBackupsMonthlyPrice, label, regions, selectedLinodeID,
    selectedRegionID, selectedTypeID, types, linodes, extendLinodes, selectedDiskSize } = props;

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
      <SelectLinodePanel
        error={hasErrorFor('linode_id')}
        linodes={extendLinodes(linodes)}
        selectedLinodeID={selectedLinodeID}
        header={'Select Linode to Clone From'}
        handleSelection={(linode) => {
          updateFormState([
            {
              stateKey: 'selectedLinodeID',
              newValue: linode.id,
            },
            {
              stateKey: 'selectedTypeID',
              newValue: null,
            },
            {
              stateKey: 'selectedLinodeID',
              newValue: linode.specs.disk,
            },
          ]);
        }}
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
        selectedDiskSize={selectedDiskSize}
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
      <AddonsPanel
        backups={backups}
        backupsMonthly={getBackupsMonthlyPrice()}
        privateIP={privateIP}
        changeBackups={() =>
          updateFormState([{ stateKey: 'backups', newValue: !backups }])}
        changePrivateIP={() =>
          updateFormState([{ stateKey: 'privateIP', newValue: !privateIP }])}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(FromLinodeContent);
