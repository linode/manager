import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

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

import {
  allocatePrivateIP,
  createLinode,
} from 'src/services/linodes';

import { resetEventsPolling } from 'src/events';

import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';

// import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';


type ClassNames = 'root'
  | 'main'
  | 'sidebar'
  | 'emptyImagePanel'
  | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  main: {},
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130,
    },
  },
  emptyImagePanel: {
    padding: theme.spacing.unit * 3,
  },
  emptyImagePanelText: {
    marginTop: theme.spacing.unit,
    padding: `${theme.spacing.unit}px 0`,
  },
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
  compatibleImages: Linode.Image[];
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  udf: 'UDF',
};

type CombinedProps = Props & WithStyles<ClassNames>;

export class FromStackScriptContent extends React.Component<CombinedProps, State> {
  state: State = {
    userDefinedFields: [],
    udf_data: null,
    selectedStackScriptID: null,
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    backups: false,
    privateIP: false,
    label: '',
    password: '',
    isMakingRequest: false,
    compatibleImages: [],
  };

  mounted: boolean = false;

  handleSelectStackScript = (id: number, stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => {
    const { images } = this.props;
    const filteredImages = images.filter((image) => {
      for (let i = 0; i < stackScriptImages.length; i = i + 1) {
        if (image.id === stackScriptImages[i]) {
          return true;
        }
      }
      return false;
    });

    const defaultUDFData = {};
    userDefinedFields.forEach((eachField) => {
      if (!!eachField.default) {
        defaultUDFData[eachField.name] = eachField.default;
      }
    });
    // first need to make a request to get the stackscript
    // then update userDefinedFields to the fields returned
    this.setState({
      selectedStackScriptID: id,
      compatibleImages: filteredImages,
      userDefinedFields,
      udf_data: defaultUDFData,
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

  createFromStackScript = () => {
    if (!this.state.selectedStackScriptID) {
      this.scrollToTop();
      this.setState({
        errors: [
          { field: 'stackscript_id', reason: 'You must select a StackScript' },
        ],
      });
      return;
    }
    this.createLinode();
  }

  createLinode = () => {
    const { history } = this.props;
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      selectedStackScriptID,
      udf_data,
      label,
      password,
      backups,
      privateIP,
    } = this.state;

    this.setState({ isMakingRequest: true });

    createLinode({
      region: selectedRegionID,
      type: selectedTypeID,
      stackscript_id: selectedStackScriptID,
      stackscript_data: udf_data,
      label, /* optional */
      root_pass: password, /* required if image ID is provided */
      image: selectedImageID, /* optional */
      backups_enabled: backups, /* optional */
      booted: true,
    })
      .then((linode) => {
        if (privateIP) allocatePrivateIP(linode.id);
        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.scrollToTop();

        if (error.response && error.response.data && error.response.data.errors) {
          const listOfErrors = error.response.data.errors;
          const updatedErrorList = listOfErrors.map((error: Linode.ApiFieldError) => {
            if (error.reason.toLowerCase().includes('udf')) {
              return { ...error, field: 'udf' };
            }
            return error;
          });
          this.setState(() => ({
            errors: updatedErrorList,
          }));
        }
      })
      .finally(() => {
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { errors, userDefinedFields, udf_data, selectedImageID, selectedRegionID,
      selectedStackScriptID, selectedTypeID, backups, privateIP, label,
      password, isMakingRequest, compatibleImages } = this.state;

    const { notice, getBackupsMonthlyPrice, regions, types, classes,
      getRegionName, getTypeInfo } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');
    const udfErrors = (errors) ? errors.filter(error => error.field === 'udf') : undefined;

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
            error={hasErrorFor('stackscript_id')}
            selectedId={selectedStackScriptID}
            shrinkPanel={true}
            updateFor={[selectedStackScriptID, errors]}
            onSelect={this.handleSelectStackScript}
          />
          {userDefinedFields && userDefinedFields.length > 0 &&
            <UserDefinedFieldsPanel
              errors={udfErrors}
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data}
            />
          }
          {compatibleImages && compatibleImages.length > 0
            ? <SelectImagePanel
              images={compatibleImages}
              handleSelection={this.handleSelectImage}
              updateFor={[selectedImageID, compatibleImages, errors]}
              selectedImageID={selectedImageID}
            />
            : <Paper className={classes.emptyImagePanel}>
              {/* empty state for images */}
              <Typography variant="title">
                Select Image
              </Typography>
              <Typography variant="body1" className={classes.emptyImagePanelText}>
                No Compatible Images Available
              </Typography>
            </Paper>
          }
          <SelectRegionPanel
            error={hasErrorFor('region')}
            regions={regions}
            handleSelection={this.handleSelectRegion}
            selectedID={selectedRegionID}
            updateFor={[selectedRegionID, errors]}
            copy="Determine the best location for your Linode."
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={types}
            onSelect={this.handleSelectPlan}
            updateFor={[selectedTypeID, errors]}
            selectedID={selectedTypeID}
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
          <PasswordPanel
            error={hasErrorFor('root_pass')}
            updateFor={[password, errors]}
            password={password}
            handleChange={this.handleTypePassword}
          />
          <AddonsPanel
            backups={backups}
            backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
            privateIP={privateIP}
            changeBackups={this.handleToggleBackups}
            changePrivateIP={this.handleTogglePrivateIP}
            updateFor={[privateIP, backups]}
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
                    onDeploy={this.createFromStackScript}
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

