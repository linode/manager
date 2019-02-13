import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import SelectRegionPanel, {
  ExtendedRegion
} from 'src/components/SelectRegionPanel';
import { Tag } from 'src/components/TagsInput';
import { resetEventsPolling } from 'src/events';
import { cloneLinode } from 'src/services/linodes';
import { upsertLinode } from 'src/store/linodes/linodes.actions';
import { allocatePrivateIP } from 'src/utilities/allocateIPAddress';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import AddonsPanel from '../AddonsPanel';
import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import { Info } from '../util';
import withLabelGenerator, { LabelProps } from '../withLabelGenerator';
import { renderBackupsDisplaySection } from './utils';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  main: {},
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130
    }
  }
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      backupsMonthly: number | null;
    }
  | undefined;

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
  tags: Tag[];
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
  accountBackups: boolean;
  disabled?: boolean;
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password'
};

type CombinedProps = Props &
  WithUpsertLinode &
  InjectedNotistackProps &
  LabelProps &
  WithStyles<ClassNames>;

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
    tags: []
  };

  mounted: boolean = false;

  handleSelectLinode = (linode: Linode.Linode) => {
    this.setState({
      selectedLinodeID: linode.id,
      selectedTypeID: null,
      selectedDiskSize: linode.specs.disk
    });
  };

  handleSelectRegion = (id: string) => {
    this.setState({ selectedRegionID: id });
  };

  handleSelectPlan = (id: string) => {
    this.setState({ selectedTypeID: id });
  };

  handleChangeTags = (selected: Tag[]) => {
    this.setState({ tags: selected });
  };

  handleTypePassword = (value: string) => {
    this.setState({ password: value });
  };

  handleToggleBackups = () => {
    this.setState({ backups: !this.state.backups });
  };

  handleTogglePrivateIP = () => {
    this.setState({ privateIP: !this.state.privateIP });
  };

  cloneLinode = () => {
    const { history } = this.props;
    const {
      selectedRegionID,
      selectedTypeID,
      selectedLinodeID,
      backups, // optional
      privateIP,
      tags
    } = this.state;

    this.setState({ isMakingRequest: true });

    const label = this.label();

    cloneLinode(selectedLinodeID!, {
      region: selectedRegionID,
      type: selectedTypeID,
      label: label ? label : null,
      backups_enabled: backups,
      tags: tags.map((item: Tag) => item.value)
    })
      .then(linode => {
        if (privateIP) {
          allocatePrivateIP(linode.id);
        }
        this.props.upsertLinode(linode);
        this.props.enqueueSnackbar(`Your Linode is being cloned.`, {
          variant: 'success'
        });

        resetEventsPolling();
        history.push('/linodes');
      })
      .catch(error => {
        if (!this.mounted) {
          return;
        }

        this.setState(
          () => ({
            errors:
              error.response &&
              error.response.data &&
              error.response.data.errors
          }),
          () => {
            scrollErrorIntoView();
          }
        );
      })
      .finally(() => {
        if (!this.mounted) {
          return;
        }
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  label = () => {
    const { selectedLinodeID, selectedRegionID } = this.state;
    const { getLabel, linodes } = this.props;

    const selectedLinode = linodes.find(l => l.id === selectedLinodeID);
    const linodeLabel = selectedLinode && selectedLinode.label;

    return getLabel(linodeLabel, 'clone', selectedRegionID);
  };

  render() {
    const {
      errors,
      backups,
      privateIP,
      selectedLinodeID,
      tags,
      selectedRegionID,
      selectedTypeID,
      selectedDiskSize,
      isMakingRequest
    } = this.state;

    const {
      accountBackups,
      notice,
      types,
      linodes,
      regions,
      extendLinodes,
      getBackupsMonthlyPrice,
      getTypeInfo,
      getRegionInfo,
      classes,
      updateCustomLabel,
      disabled
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const regionInfo = getRegionInfo(selectedRegionID);

    const typeInfo = getTypeInfo(selectedTypeID);

    const hasBackups = backups || accountBackups;

    const label = this.label();

    return (
      <React.Fragment>
        {linodes && linodes.length === 0 ? (
          <Grid item className={`${classes.main} mlMain`}>
            <Placeholder
              icon={VolumeIcon}
              copy="You do not have any existing Linodes to clone from.
                  Please first create a Linode from either an Image or StackScript."
              title="Clone from Existing Linode"
            />
          </Grid>
        ) : (
          <React.Fragment>
            <Grid item className={`${classes.main} mlMain`}>
              <CreateLinodeDisabled isDisabled={disabled} />
              {notice && !disabled && (
                <Notice
                  text={notice.text}
                  error={notice.level === 'error'}
                  warning={notice.level === 'warning'}
                />
              )}
              {generalError && <Notice text={generalError} error={true} />}
              <SelectLinodePanel
                error={hasErrorFor('linode_id')}
                linodes={extendLinodes(linodes)}
                selectedLinodeID={selectedLinodeID}
                header={'Select Linode to Clone From'}
                handleSelection={this.handleSelectLinode}
                updateFor={[selectedLinodeID, errors]}
                disabled={disabled}
              />
              <SelectRegionPanel
                error={hasErrorFor('region')}
                regions={regions}
                handleSelection={this.handleSelectRegion}
                selectedID={selectedRegionID}
                copy="Determine the best location for your Linode."
                updateFor={[selectedRegionID, errors]}
                disabled={disabled}
              />
              <SelectPlanPanel
                error={hasErrorFor('type')}
                types={types}
                onSelect={this.handleSelectPlan}
                selectedID={selectedTypeID}
                selectedDiskSize={selectedDiskSize}
                updateFor={[selectedDiskSize, selectedTypeID, errors]}
                disabled={disabled}
              />
              <LabelAndTagsPanel
                labelFieldProps={{
                  label: 'Linode Label',
                  value: label || '',
                  onChange: updateCustomLabel,
                  errorText: hasErrorFor('label'),
                  disabled
                }}
                tagsInputProps={{
                  value: tags,
                  onChange: this.handleChangeTags,
                  tagError: hasErrorFor('tag'),
                  disabled
                }}
                updateFor={[tags, label, errors]}
              />
              <AddonsPanel
                backups={backups}
                accountBackups={accountBackups}
                backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
                privateIP={privateIP}
                changeBackups={this.handleToggleBackups}
                changePrivateIP={this.handleTogglePrivateIP}
                updateFor={[privateIP, backups, selectedTypeID]}
                disabled={disabled}
              />
            </Grid>
            <Grid item className={`${classes.sidebar} mlSidebar`}>
              <Sticky topOffset={-24} disableCompensation>
                {(props: StickyProps) => {
                  const displaySections = [];
                  if (regionInfo) {
                    displaySections.push({
                      title: regionInfo.title,
                      details: regionInfo.details
                    });
                  }

                  if (typeInfo) {
                    displaySections.push(typeInfo);
                  }

                  if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
                    displaySections.push(
                      renderBackupsDisplaySection(
                        accountBackups,
                        typeInfo.backupsMonthly
                      )
                    );
                  }

                  let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
                  if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
                    calculatedPrice += typeInfo.backupsMonthly;
                  }

                  return (
                    <CheckoutBar
                      heading={`${label || 'Linode'} Summary`}
                      calculatedPrice={calculatedPrice}
                      isMakingRequest={isMakingRequest}
                      disabled={isMakingRequest || disabled}
                      onDeploy={this.cloneLinode}
                      displaySections={displaySections}
                      {...props}
                    />
                  );
                }}
              </Sticky>
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
interface WithUpsertLinode {
  upsertLinode: (l: Linode.Linode) => void;
}

const WithUpsertLinode = connect(
  undefined,
  { upsertLinode }
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  WithUpsertLinode,
  styled,
  withSnackbar,
  withLabelGenerator
);

export default enhanced(FromLinodeContent);
