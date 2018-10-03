import { pathOr } from 'ramda';import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { resetEventsPolling } from 'src/events';
import { Info } from 'src/features/linodes/LinodesCreate/LinodesCreate';
import { allocatePrivateIP, cloneLinode } from 'src/services/linodes';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import AddonsPanel from '../AddonsPanel';
import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  main: {},
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130,
    },
  },
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

interface State {
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  selectedLinodeID: number | undefined;
  selectedDiskSize?: number;
  label: string;
  errors?: Linode.ApiFieldError[];
  backups: boolean;
  privateIP: boolean;
  password: string | null;
  isMakingRequest: boolean;
}

interface Props {
  notice?: Notice;
  regions: ExtendedRegion[];
  types: ExtendedType[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  extendLinodes: (linodes: Linode.Linode[]) => ExtendedLinode[];
  linodes: Linode.Linode[];
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionInfo: (selectedRegionID: string | null) => Info;
  history: any;
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

type CombinedProps = Props & WithStyles<ClassNames>;

export class FromLinodeContent extends React.Component<CombinedProps, State> {
  state: State = {
    selectedImageID: null,
    selectedTypeID: null,
    selectedRegionID: null,
    password: '',
    label: '',
    backups: false,
    privateIP: false,
    isMakingRequest: false,
    selectedLinodeID: undefined,
  };

  mounted: boolean = false;

  handleSelectLinode = (linode: Linode.Linode) => {
    this.setState({
      selectedLinodeID: linode.id,
      selectedTypeID: null,
      selectedDiskSize: linode.specs.disk,
    });
  }

  handleSelectRegion = (id: string) => {
    this.setState({ selectedRegionID: id });
  }

  handleSelectPlan = (id: string) => {
    this.setState({ selectedTypeID: id });
  }

  handleTypeLabel = (e: any) => {
    this.setState({ label: e.target.value });
  }

  handleTypePassword = (value: string) => {
    this.setState({ password: value });
  }

  handleToggleBackups = () => {
    this.setState({ backups: !this.state.backups });
  }

  handleTogglePrivateIP = () => {
    this.setState({ privateIP: !this.state.privateIP });
  }

  cloneLinode = () => {
    const { history } = this.props;
    const {
      selectedRegionID,
      selectedTypeID,
      selectedLinodeID,
      label, // optional
      backups, // optional
      privateIP,
    } = this.state;

    this.setState({ isMakingRequest: true });

    cloneLinode(selectedLinodeID!, {
      region: selectedRegionID,
      type: selectedTypeID,
      label,
      backups_enabled: backups,
    })
      .then((linode) => {
        if (privateIP) { allocatePrivateIP(linode.id) };
        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.setState(() => ({
          errors: error.response && error.response.data && error.response.data.errors,
        }), () => {
          scrollErrorIntoView();
        });
      })
      .finally(() => {
        if (!this.mounted) { return; }
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  render() {
    const { errors, backups, privateIP, label, selectedLinodeID,
      selectedRegionID, selectedTypeID, selectedDiskSize, isMakingRequest } = this.state;

    const { notice, types, linodes, regions, extendLinodes, getBackupsMonthlyPrice,
      getTypeInfo, getRegionInfo, classes } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const regionInfo = getRegionInfo(selectedRegionID);

    const typeInfo = getTypeInfo(selectedTypeID);

    return (
      <React.Fragment>
        {
          (linodes && linodes.length === 0)
            ? <Grid item className={`${classes.main} mlMain`}>
                <Placeholder
                  icon={VolumeIcon}
                  copy="You do not have any existing Linodes to clone from.
                  Please first create a Linode from either an Image or StackScript."
                  title="Clone from Existing Linode"
                />
              </Grid>
            : <React.Fragment>
              <Grid item className={`${classes.main} mlMain`}>
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
                  handleSelection={this.handleSelectLinode}
                  updateFor={[selectedLinodeID, errors]}
                />
                <SelectRegionPanel
                  error={hasErrorFor('region')}
                  regions={regions}
                  handleSelection={this.handleSelectRegion}
                  selectedID={selectedRegionID}
                  copy="Determine the best location for your Linode."
                  updateFor={[selectedRegionID, errors]}
                />
                <SelectPlanPanel
                  error={hasErrorFor('type')}
                  types={types}
                  onSelect={this.handleSelectPlan}
                  selectedID={selectedTypeID}
                  selectedDiskSize={selectedDiskSize}
                  updateFor={[selectedDiskSize, selectedTypeID, errors]}
                />
                <LabelAndTagsPanel
                  labelFieldProps={{
                    label: 'Linode Label',
                    value: label || '',
                    onChange: this.handleTypeLabel,
                    errorText: hasErrorFor('label'),
                  }}
                  updateFor={[label]}
                />
                <AddonsPanel
                  backups={backups}
                  backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
                  privateIP={privateIP}
                  changeBackups={this.handleToggleBackups}
                  changePrivateIP={this.handleTogglePrivateIP}
                  updateFor={[privateIP, backups, selectedTypeID]}
                />
              </Grid>
              <Grid item className={`${classes.sidebar} mlSidebar`}>
                <Sticky
                  topOffset={-24}
                  disableCompensation>
                  {
                    (props: StickyProps) => {
                      const displaySections = [];
                      if (regionInfo) {
                        displaySections.push({
                          title: regionInfo.title,
                          details: regionInfo.details,
                        });
                      }

                      if (typeInfo) {
                        displaySections.push(typeInfo);
                      }

                      if (backups && typeInfo && typeInfo.backupsMonthly) {
                        displaySections.push({
                          title: 'Backups Enabled',
                          ...(typeInfo.backupsMonthly &&
                            { details: `$${typeInfo.backupsMonthly.toFixed(2)} / monthly` }),
                        });
                      }

                      let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
                      if (backups && typeInfo && typeInfo.backupsMonthly) {
                        calculatedPrice += typeInfo.backupsMonthly;
                      }

                      return (
                        <CheckoutBar
                          heading={`${label || 'Linode'} Summary`}
                          calculatedPrice={calculatedPrice}
                          disabled={isMakingRequest}
                          onDeploy={this.cloneLinode}
                          displaySections={displaySections}
                          {...props}
                        />
                      );
                    }
                  }
                </Sticky>
              </Grid>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(FromLinodeContent);
