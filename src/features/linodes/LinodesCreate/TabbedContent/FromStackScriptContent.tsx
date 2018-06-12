import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import { pathOr, assocPath } from 'ramda';

import { Sticky, StickyProps } from 'react-sticky';

import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import SelectImagePanel from '../SelectImagePanel';
import PasswordPanel from '../PasswordPanel';
import AddonsPanel from '../AddonsPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import Notice from 'src/components/Notice';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Grid from 'src/components/Grid';
import CheckoutBar from 'src/components/CheckoutBar';

// import {
//   allocatePrivateIP,
//   createLinode,
// } from 'src/services/linodes';

import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';


import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';


type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  main: {},
  sidebar: {},
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

type Info = { title: string, details?: string } | undefined;

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

interface Props {
  notice?: Notice;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionName: (selectedRegionID: string | null) => string | undefined;
  history: any;
}

interface State {
  userDefinedFields: Linode.StackScript.UserDefinedField[];
  udf_data: any;
  errors?: Linode.ApiFieldError[];
  selectedStackScriptID: number | null;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  backups: boolean;
  privateIP: boolean;
  label: string | null;
  password: string | null;
  isMakingRequest: boolean;
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
    udf_data: [],
    selectedStackScriptID: null,
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    backups: false,
    privateIP: false,
    label: '',
    password: '',
    isMakingRequest: false,
  };

  mounted: boolean = false;

  handleSelectStackScript = (id: number) => {
    this.setState({
      selectedStackScriptID: id,
      // prob gonna need to update UDF here too
    });
  }

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.state.udf_data);

    this.setState({
      udf_data: { ...this.state.udf_data, ...newUDFData },
    });
  }

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

  scrollToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  cloneLinode = () => {
    console.log('created!');
  }

  componentDidMount() {
    this.mounted = true;

    // add fields with default values to formState here
    const { userDefinedFields } = this.state;
    const defaultUDFData = {};
    userDefinedFields.forEach((eachField) => {
      if (!!eachField.default) {
        defaultUDFData[eachField.name] = eachField.default;
      }
    });
    this.setState({ udf_data: defaultUDFData });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { errors, userDefinedFields, udf_data, selectedImageID, selectedRegionID,
      selectedStackScriptID, selectedTypeID, backups, privateIP, label,
      password, isMakingRequest } = this.state;

    const { notice, getBackupsMonthlyPrice, images, regions, types, classes,
      getRegionName, getTypeInfo } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const regionName = getRegionName(selectedRegionID);
    const typeInfo = getTypeInfo(selectedTypeID);
    const imageInfo = this.getImageInfo(this.props.images.find(
      image => image.id === selectedImageID));

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
          <SelectStackScriptPanel
            selectedId={selectedStackScriptID}
            shrinkPanel={true}
            updateFor={[selectedStackScriptID]}
            onSelect={this.handleSelectStackScript}
          />
          <UserDefinedFieldsPanel
            handleChange={this.handleChangeUDF}
            userDefinedFields={userDefinedFields}
            udf_data={udf_data}
          />
          <SelectImagePanel
            images={images}
            handleSelection={this.handleSelectImage}
            selectedImageID={selectedImageID}
          />
          <SelectRegionPanel
            error={hasErrorFor('region')}
            regions={regions}
            handleSelection={this.handleSelectRegion}
            selectedID={selectedRegionID}
            copy="Determine the best location for your Linode."
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={types}
            onSelect={this.handleSelectPlan}
            selectedID={selectedTypeID}
          />
          <LabelAndTagsPanel
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: this.handleTypeLabel,
              errorText: hasErrorFor('label'),
            }}
          />
          <PasswordPanel
            error={hasErrorFor('root_pass')}
            password={password}
            handleChange={this.handleTypePassword}
          />
          <AddonsPanel
            backups={backups}
            backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
            privateIP={privateIP}
            changeBackups={this.handleToggleBackups}
            changePrivateIP={this.handleTogglePrivateIP}
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

                if (regionName) {
                  displaySections.push({ title: regionName });
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
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(FromStackScriptContent);

