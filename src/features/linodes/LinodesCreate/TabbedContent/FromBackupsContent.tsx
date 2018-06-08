import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import { compose } from 'ramda';

import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
import SelectBackupPanel from '../SelectBackupPanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import AddonsPanel from '../AddonsPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import Notice from 'src/components/Notice';

import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import CircleProgress from 'src/components/CircleProgress';
import Placeholder from 'src/components/Placeholder';

import { StateToUpdate as FormState } from '../LinodesCreate';

import {
  getLinodeBackups,
} from 'src/services/linodes';

import * as Promise from 'bluebird';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface BackupInfo {
  title: string;
  details: string;
}

interface Props {
  notice?: Notice;
  errors?: Linode.ApiFieldError[];
  updateFormState: (stateToUpdate: FormState[]) => void;
  selectedLinodeID: number | undefined;
  selectedBackupID: number | undefined;
  selectedDiskSize: number | undefined;
  selectedTypeID: string | null;
  linodes: Linode.Linode[];
  types: ExtendedType[];
  label: string | null;
  backups: boolean;
  privateIP: boolean;
  extendLinodes: (linodes: Linode.Linode[]) => ExtendedLinode[];
  getBackupsMonthlyPrice: () => number | null;
}

interface State {
  linodesWithBackups: Linode.LinodeWithBackups[] | null;
  isGettingBackups: boolean;
  userHasBackups: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

const filterLinodesWithBackups = (linodes: Linode.Linode[]) =>
  linodes.filter(linode => linode.backups.enabled);

export class FromBackupsContent extends React.Component<CombinedProps, State> {
  state: State = {
    linodesWithBackups: [],
    isGettingBackups: false,
    userHasBackups: false,
  };

  getLinodesWithBackups = (linodes: Linode.Linode[]) => {
    this.setState({ isGettingBackups: true });
    this.props.updateFormState([{
      stateKey: 'userHasBackups',
      newValue: false,
    }]);
    return Promise.map(linodes.filter(l => l.backups.enabled), (linode: Linode.Linode) => {
      return getLinodeBackups(linode.id)
        .then((backups) => {
          return {
            ...linode,
            currentBackups: {
              ...backups,
            },
          };
        });
    }).then((data) => {
      this.props.updateFormState([{
        stateKey: 'userHasBackups',
        newValue: this.userHasBackups(data),
      }]);
      this.setState({ linodesWithBackups: data, isGettingBackups: false });
    })
      .catch(err => this.setState({ isGettingBackups: false }));
  }

  userHasBackups = (linodesWithBackups: Linode.LinodeWithBackups[]) => {
    return linodesWithBackups!.some((linode: Linode.LinodeWithBackups) => {
      // automatic backups is an array, but snapshots are either null or an object
      // user can have up to 3 automatic backups, but one one snapshot
      return !!linode.currentBackups.automatic.length || !!linode.currentBackups.snapshot.current;
    });
  }

  componentDidMount() {
    this.getLinodesWithBackups(this.props.linodes);
  }

  render() {
    const { errors, notice, selectedBackupID, selectedDiskSize, selectedLinodeID,
      selectedTypeID, updateFormState, linodes, types, label, backups,
       privateIP, extendLinodes, getBackupsMonthlyPrice } = this.props;
    const { linodesWithBackups } = this.state;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {(this.state.isGettingBackups)
          ? <CircleProgress />
          : (!this.userHasBackups(linodesWithBackups!))
            ? <Placeholder
            icon={VolumeIcon}
                copy="You either do not have backups enabled for any Linode
                or your Linodes have not been backed up. Please visit the 'Backups'
                panel in the Linode Settings view"
                title="Create from Backup"
                />
                : <React.Fragment>
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
          linodes={compose(
            (linodes: Linode.Linode[]) => extendLinodes(linodes),
            filterLinodesWithBackups,
          )(linodes)}
          selectedLinodeID={selectedLinodeID}
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
                stateKey: 'selectedRegionID',
                newValue: linode.region,
              },
              {
                stateKey: 'selectedDiskSize',
                newValue: linode.specs.disk,
              },
              {
                stateKey: 'selectedBackupID',
                newValue: undefined,
              },
            ]);
          }
          }
        />
        <SelectBackupPanel
          error={hasErrorFor('backup_id')}
          backups={linodesWithBackups!
            .filter((linode: Linode.LinodeWithBackups) => {
              return linode.id === +selectedLinodeID!;
            })}
          selectedLinodeID={selectedLinodeID}
          selectedBackupID={selectedBackupID}
          handleChangeBackup={(id: number) =>
            updateFormState([{ stateKey: 'selectedBackupID', newValue: id }])
          }
          handleChangeBackupInfo={(info: BackupInfo) =>
            updateFormState([{ stateKey: 'selectedBackupInfo', newValue: info }])
          }
        />
        <SelectPlanPanel
          error={hasErrorFor('type')}
          types={types}
          onSelect={(id: string) => {
            updateFormState([{ stateKey: 'selectedTypeID', newValue: id }]);
          }}
          // this.setState({ selectedTypeID: id })}
          selectedID={selectedTypeID}
          selectedDiskSize={selectedDiskSize}
        />
        <LabelAndTagsPanel
          labelFieldProps={{
            label: 'Linode Label',
            value: label || '',
            onChange: (e) => {
              updateFormState([{ stateKey: 'label', newValue: e.target.value }]);
            },
            // this.setState({ label: e.target.value }),
            errorText: hasErrorFor('label'),
          }}
        />
        <AddonsPanel
          backups={backups}
          changeBackups={() => {
            updateFormState([{ stateKey: 'backups', newValue: !backups }]);
          }}
          changePrivateIP={() => {
            updateFormState([{ stateKey: 'privateIP', newValue: !privateIP }]);
          }}
          backupsMonthly={getBackupsMonthlyPrice()}
          privateIP={privateIP}
        />
        </React.Fragment>
          }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(FromBackupsContent);


