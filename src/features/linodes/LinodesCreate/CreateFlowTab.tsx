import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import SelectLinodePanel, { Props as SelectLinodeProps } from './SelectLinodePanel';
import SelectImagePanel, { Props as SelectImageProps } from './SelectImagePanel';
import SelectBackupPanel, { Props as SelectBackupProps } from './SelectBackupPanel';
import SelectRegionPanel, { Props as SelectRegionProps } from 'src/components/SelectRegionPanel';
// import SelectPlanPanel, { ExtendedType } from './SelectPlanPanel';
// import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
// import PasswordPanel from './PasswordPanel';
// import AddonsPanel from './AddonsPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import Notice from 'src/components/Notice';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

interface Props {
  selectLinode?: SelectLinodeProps;
  selectRegion?: SelectRegionProps;
  selectImage?: SelectImageProps;
  selectBackup?: SelectBackupProps;
  notice?: Notice;
  selectPlan?: boolean;
  selectLabel?: boolean;
  selectAddOns?: boolean;
  selectPassword?: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

const CreateFlowTab: React.StatelessComponent<CombinedProps> = (props) => {
  const { errors, notice, selectImage, selectLinode,
    selectBackup, selectRegion } = props;
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
      {selectImage &&
        <SelectImagePanel
          images={selectImage.images}
          handleSelection={selectImage.handleSelection}
          selectedImageID={selectImage.selectedImageID}
        />
      }
      {selectLinode &&
        <SelectLinodePanel
          error={hasErrorFor('linode_id')}
          linodes={selectLinode.linodes}
          selectedLinodeID={selectLinode.selectedLinodeID}
          handleSelection={selectLinode.handleSelection}
        />
      }
      {selectBackup &&
        <SelectBackupPanel
          error={hasErrorFor('backup_id')}
          backups={selectBackup.backups}
          selectedLinodeID={selectBackup.selectedLinodeID}
          selectedBackupID={selectBackup.selectedBackupID}
          handleSelection={selectBackup.handleSelection}
        />
      }
      {selectRegion &&
        <SelectRegionPanel
          error={hasErrorFor('region')}
          regions={selectRegion.regions}
          handleSelection={selectRegion.handleSelection}
          selectedID={selectRegion.selectedID}
          copy={selectRegion.copy}
        />
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(CreateFlowTab);
