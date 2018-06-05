import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

// import { compose } from 'ramda';

// import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
// import SelectBackupPanel from '../SelectBackupPanel';
// import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
// import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
// import AddonsPanel from '../AddonsPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import Notice from 'src/components/Notice';

// import { State as FormState } from '../LinodesCreate';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

interface Props {
  errors: Linode.ApiFieldError[];
  notice: Notice;
}

interface State {
  // hi
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

class FromBackupsContent extends React.Component<CombinedProps, State> {
  state: State = {
    linodesWithBackups: [],
    isGettingBackups: false,
    userHasBackups: false,
  };

  componentDidMount() {
    // hello world
  }

  render() {
    const { notice, errors } = this.props;

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
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(FromBackupsContent);


