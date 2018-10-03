import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import AccessPanel, { Disabled, UserSSHKeyObject } from 'src/components/AccessPanel';
import CheckoutBar from 'src/components/CheckoutBar';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { resetEventsPolling } from 'src/events';
import { Info } from 'src/features/linodes/LinodesCreate/LinodesCreate';
import userSSHKeyHoc from 'src/features/linodes/userSSHKeyHoc';
import { allocatePrivateIP, createLinode } from 'src/services/linodes';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import tagsHoc, { TagObject } from '../tagsHoc';

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

interface Props {
  errors?: Linode.ApiFieldError[];
  notice?: Notice;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionInfo: (selectedRegionID: string | null) => Info;
  history: any;

  /** Comes from HOC */
  userSSHKeys: UserSSHKeyObject[];
  tagObject: TagObject;
  handleDisablePasswordField: (imageSelected: boolean) => Disabled | undefined;
}

interface State {
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  label: string;
  errors?: Linode.ApiFieldError[];
  backups: boolean;
  privateIP: boolean;
  password: string | null;
  isMakingRequest: boolean;
  initTab?: number;
}

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
};

type CombinedProps = Props & WithStyles<ClassNames>;

export class FromImageContent extends React.Component<CombinedProps, State> {
  state: State = {
    selectedImageID: pathOr(null, ['history', 'location', 'state', 'selectedImageId'], this.props),
    selectedTypeID: null,
    selectedRegionID: null,
    password: '',
    label: '',
    backups: false,
    privateIP: false,
    isMakingRequest: false,
    initTab: pathOr(null, ['history', 'location', 'state', 'initTab'], this.props),
  };

  mounted: boolean = false;

  handleSelectImage = (id: string) => {
    this.setState({ selectedImageID: id });
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

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return image && {
      title: `${image.vendor || image.label}`,
      details: `${image.vendor ? image.label : ''}`,
    };
  }

  createNewLinode = () => {
    const { history, tagObject, userSSHKeys } = this.props;
    const { getLinodeTagList } = tagObject.actions;
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      label,
      password,
      backups,
      privateIP,
    } = this.state;

    this.setState({ isMakingRequest: true });

    createLinode({
      region: selectedRegionID,
      type: selectedTypeID,
      label, /* optional */
      root_pass: password, /* required if image ID is provided */
      image: selectedImageID, /* optional */
      backups_enabled: backups, /* optional */
      booted: true,
      authorized_users: userSSHKeys.filter(u => u.selected).map((u) => u.username),
      tags: getLinodeTagList()
    })
      .then((linode) => {
        if (privateIP) { allocatePrivateIP(linode.id); }
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
    const { errors, backups, privateIP, label, selectedImageID,
      selectedRegionID, selectedTypeID, password, isMakingRequest, initTab } = this.state;

      
    const { classes, notice, types, regions, images, getBackupsMonthlyPrice,
      getRegionInfo, getTypeInfo, tagObject, userSSHKeys } = this.props;
        
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const imageInfo = this.getImageInfo(this.props.images.find(
      image => image.id === selectedImageID));

    const regionInfo = getRegionInfo(selectedRegionID);

    const typeInfo = getTypeInfo(selectedTypeID);

    return (
      <React.Fragment>
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
          <SelectImagePanel
            images={images}
            handleSelection={this.handleSelectImage}
            selectedImageID={selectedImageID}
            updateFor={[selectedImageID, errors]}
            initTab={initTab}
            error={hasErrorFor('image')}
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
            updateFor={[selectedTypeID, errors]}
          />
          <LabelAndTagsPanel
            tagObject={tagObject}
            tagError={hasErrorFor('tag')}
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: this.handleTypeLabel,
              errorText: hasErrorFor('label'),
            }}
            updateFor={[tagObject, label, errors]}
          />
          <AccessPanel
           /* disable the password field if we haven't selected an image */
            passwordFieldDisabled={this.props.handleDisablePasswordField(!!selectedImageID)}
            error={hasErrorFor('root_pass')}
            password={password}
            handleChange={this.handleTypePassword}
            updateFor={[password, errors, userSSHKeys, selectedImageID]}
            users={userSSHKeys.length > 0 && selectedImageID ? userSSHKeys : []}
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
                if (imageInfo) {
                  displaySections.push(imageInfo);
                }

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
                    onDeploy={this.createNewLinode}
                    displaySections={displaySections}
                    {...props}
                  />
                );
              }
            }
          </Sticky>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(styled, userSSHKeyHoc, tagsHoc);

export default enhanced(FromImageContent) as any;
