import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

// import SelectLinodePanel, { ExtendedLinode } from './SelectLinodePanel';
import SelectImagePanel from './SelectImagePanel';
// import SelectBackupPanel from './SelectBackupPanel';
// import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
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

interface SelectImage {
  images: Linode.Image[];
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: string) => void;
  selectedImageID: string | null;
}

interface Props {
  selectLinode?: boolean;
  selectRegion?: boolean;
  selectImage?: SelectImage;
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
  const { errors, notice, selectImage } = props;
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
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(CreateFlowTab);
