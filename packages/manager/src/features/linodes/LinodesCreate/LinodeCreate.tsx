import { restoreBackup } from '@linode/api-v4/lib/linodes';
import { Tag } from '@linode/api-v4/lib/tags/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import CheckoutBar, { DisplaySectionList } from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import DocsSidebar from 'src/components/DocsSidebar';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TabLinkList, { Tab } from 'src/components/TabLinkList';
import { WithImages } from 'src/containers/withImages.container';
import { AppsDocs } from 'src/documentation';
import SMTPRestrictionText from 'src/features/linodes/SMTPRestrictionText';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';
import { ApplicationState } from 'src/store';
import {
  CreateTypes,
  handleChangeCreateType
} from 'src/store/linodeCreate/linodeCreate.actions';
import { getInitialType } from 'src/store/linodeCreate/linodeCreate.reducer';
import { getErrorMap } from 'src/utilities/errorUtils';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import AddonsPanel from './AddonsPanel';
import SelectPlanPanel from './SelectPlanPanel';
import FromAppsContent from './TabbedContent/FromAppsContent';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import { renderBackupsDisplaySection } from './TabbedContent/utils';
import {
  AllFormStateAndHandlers,
  AppsData,
  HandleSubmit,
  Info,
  ReduxStateProps,
  ReduxStatePropsAndSSHKeys,
  StackScriptFormStateHandlers,
  WithDisplayData,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps,
  WithTypesRegionsAndImages
} from './types';

type ClassNames = 'root' | 'form' | 'stackScriptWrapper' | 'imageSelect';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      '& .mlMain': {
        maxWidth: '100%',
        flexBasis: '100%',
        [theme.breakpoints.up('md')]: {
          maxWidth: '78.8%',
          flexBasis: '78.8%'
        }
      },
      '& .mlSidebar': {
        position: 'static',
        width: '100%',
        flexBasis: '100%',
        maxWidth: '100%',
        [theme.breakpoints.up('md')]: {
          position: 'sticky',
          maxWidth: '21.2%',
          flexBasis: '21.2%'
        }
      }
    },
    form: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        display: 'flex'
      }
    },
    stackScriptWrapper: {
      padding: theme.spacing(3),
      '& [role="tablist"]': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing()
      }
    },
    imageSelect: {
      '& .MuiPaper-root': {
        padding: 0
      }
    }
  });
interface Props {
  history: any;
  createType: CreateTypes;
  updatePassword: (password: string) => void;
  regionDisplayInfo: Info;
  imageDisplayInfo: Info;
  typeDisplayInfo: Info;
  backupsMonthlyPrice?: number | null;
  updateLinodeID: (id: number, diskSize?: number | undefined) => void;
  updateDiskSize: (size: number) => void;
  label: string;
  updateLabel: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  toggleBackupsEnabled: () => void;
  togglePrivateIPEnabled: () => void;
  updateTags: (tags: Tag[]) => void;
  handleSubmitForm: HandleSubmit;
  resetCreationState: () => void;
  setBackupID: (id: number) => void;
  showGeneralError?: boolean;
  setVlanID: (ids: number[]) => void;
}

const errorMap = [
  'backup_id',
  'image',
  'label',
  'linode_id',
  'region',
  'root_pass',
  'stackscript_id',
  'type',
  'interfaces'
];

type InnerProps = WithTypesRegionsAndImages &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  Props;

type CombinedProps = Props &
  InnerProps &
  AllFormStateAndHandlers &
  AppsData &
  ReduxStatePropsAndSSHKeys &
  SetDocsProps &
  StateProps &
  WithDisplayData &
  WithImages &
  WithLinodesProps &
  WithRegionsProps &
  WithStyles<ClassNames> &
  WithTypesProps &
  RouteComponentProps<{}>;

interface State {
  selectedTab: number;
  stackScriptSelectedTab: number;
}

interface CreateTab extends Tab {
  type: CreateTypes;
}

export class LinodeCreate extends React.PureComponent<
  CombinedProps & DispatchProps,
  State
> {
  constructor(props: CombinedProps & DispatchProps) {
    super(props);

    /** Get the query params as an object, excluding the "?" */
    const queryParams = getParamsFromUrl(location.search);

    const _tabs = [
      'Distributions',
      'One-Click',
      'StackScripts',
      'Images',
      'Backups',
      'Clone Linode'
    ];

    /** Will be -1 if the query param is not found */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const preSelectedTab = _tabs.findIndex((eachTab, index) => {
      return eachTab === queryParams.type;
    });

    // If there is no specified "type" in the query params, update the Redux state
    // so that the correct request is made when the form is submitted.
    if (!queryParams.type) {
      this.props.setTab(this.tabs[0].type);
    }

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0,
      stackScriptSelectedTab:
        preSelectedTab === 2 && location.search.search('Account') > -1 ? 1 : 0
    };
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.setTab(getInitialType());
  }

  handleTabChange = (index: number) => {
    this.props.resetCreationState();

    /** set the tab in redux state */
    this.props.setTab(this.tabs[index].type);

    this.setState({
      selectedTab: index
    });
  };

  tabs: CreateTab[] = [
    {
      title: 'Distributions',
      type: 'fromImage',
      routeName: `${this.props.match.url}?type=Distributions`
    },
    {
      title: 'Marketplace',
      type: 'fromApp',
      routeName: `${this.props.match.url}?type=One-Click`
    },
    {
      title: 'StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts`
    },
    {
      title: 'Images',
      type: 'fromImage',
      routeName: `${this.props.match.url}?type=Images`
    },
    {
      title: 'Backups',
      type: 'fromBackup',
      routeName: `${this.props.match.url}?type=Backups`
    },
    {
      title: 'Clone Linode',
      type: 'fromLinode',
      routeName: `${this.props.match.url}?type=Clone%20Linode`
    }
  ];

  stackScriptTabs: CreateTab[] = [
    {
      title: 'Account StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts&subtype=Account`
    },
    {
      title: 'Community StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts&subtype=Community`
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  createLinode = () => {
    this.props.handleSubmitForm(
      {
        image: this.props.selectedImageID,
        region: this.props.selectedRegionID,
        type: this.props.selectedTypeID,
        label: this.props.label,
        tags: this.props.tags
          ? this.props.tags.map(eachTag => eachTag.label)
          : [],
        root_pass: this.props.password,
        authorized_users: this.props.userSSHKeys
          .filter(u => u.selected)
          .map(u => u.username),
        booted: true,
        backups_enabled: this.props.backupsEnabled,
        backup_id: this.props.selectedBackupID,
        private_ip: this.props.privateIPEnabled,

        // StackScripts
        stackscript_id: this.props.selectedStackScriptID,
        stackscript_data: this.props.selectedUDFs
      },
      this.props.selectedLinodeID
    );
  };

  render() {
    const { selectedTab, stackScriptSelectedTab } = this.state;

    const {
      classes,
      linodesData,
      linodesLoading,
      linodesError,
      imagesData,
      imageDisplayInfo,
      imagesError,
      imagesLoading,
      regionsError,
      regionsData,
      regionDisplayInfo,
      regionsLoading,
      typesData,
      typeDisplayInfo,
      typesError,
      typesLoading,
      label,
      updateLabel,
      tags,
      updateTags,
      updatePassword,
      errors,
      sshError,
      userSSHKeys,
      requestKeys,
      backupsMonthlyPrice,
      userCannotCreateLinode,
      accountBackupsEnabled,
      showGeneralError,
      ...rest
    } = this.props;

    const hasErrorFor = getErrorMap(errorMap, errors);

    const generalError = getErrorMap(errorMap, errors).none;

    if (regionsLoading || imagesLoading || linodesLoading || typesLoading) {
      return <CircleProgress />;
    }

    if (regionsError || imagesError.read || linodesError || typesError) {
      return (
        <ErrorState errorText="There was an issue loading Linode creation options." />
      );
    }

    if (!linodesData || !imagesData || !regionsData || !typesData) {
      return null;
    }

    const tagsInputProps = {
      value: tags || [],
      onChange: updateTags,
      tagError: hasErrorFor.tags,
      disabled: userCannotCreateLinode
    };

    const hasBackups = Boolean(
      this.props.backupsEnabled || accountBackupsEnabled
    );

    let calculatedPrice = pathOr(0, ['monthly'], typeDisplayInfo);
    if (hasBackups && typeDisplayInfo && typeDisplayInfo.backupsMonthly) {
      calculatedPrice += typeDisplayInfo.backupsMonthly;
    }

    const displaySections = [];
    if (imageDisplayInfo) {
      displaySections.push(imageDisplayInfo);
    }

    if (regionDisplayInfo) {
      displaySections.push({
        title: regionDisplayInfo.title,
        details: regionDisplayInfo.details
      });
    }

    if (typeDisplayInfo) {
      displaySections.push(typeDisplayInfo);
    }

    if (label) {
      displaySections.push({
        title: 'Linode Label',
        details: label
      });
    }

    if (hasBackups && typeDisplayInfo && typeDisplayInfo.backupsMonthly) {
      displaySections.push(
        renderBackupsDisplaySection(
          accountBackupsEnabled,
          typeDisplayInfo.backupsMonthly
        )
      );
    }

    return (
      <form className={classes.form}>
        <Grid item className={`mlMain py0`}>
          {hasErrorFor.none && !!showGeneralError && (
            <Notice error spacingTop={8} text={hasErrorFor.none} />
          )}
          {generalError && <Notice error spacingTop={8} text={generalError} />}
          <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
          <Tabs defaultIndex={selectedTab} onChange={this.handleTabChange}>
            <TabLinkList tabs={this.tabs} />
            <TabPanels>
              <SafeTabPanel index={0}>
                <FromImageContent
                  variant="public"
                  imagePanelTitle="Choose a Distribution"
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  error={hasErrorFor.image}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <FromAppsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  // error={hasErrorFor.image}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <Tabs defaultIndex={stackScriptSelectedTab}>
                  <Paper className={classes.stackScriptWrapper}>
                    <Typography variant="h2">Create From:</Typography>
                    <TabLinkList tabs={this.stackScriptTabs} />
                    <TabPanels className={classes.imageSelect}>
                      <SafeTabPanel index={0}>
                        <FromStackScriptContent
                          category="account"
                          accountBackupsEnabled={accountBackupsEnabled}
                          userCannotCreateLinode={userCannotCreateLinode}
                          request={getMineAndAccountStackScripts}
                          header={'Select a StackScript'}
                          imagesData={imagesData!}
                          regionsData={regionsData!}
                          typesData={typesData!}
                          {...rest}
                        />
                      </SafeTabPanel>
                      <SafeTabPanel index={1}>
                        <FromStackScriptContent
                          category="community"
                          accountBackupsEnabled={accountBackupsEnabled}
                          userCannotCreateLinode={userCannotCreateLinode}
                          request={getCommunityStackscripts}
                          header={'Select a StackScript'}
                          imagesData={imagesData!}
                          regionsData={regionsData!}
                          typesData={typesData!}
                          {...rest}
                        />
                      </SafeTabPanel>
                    </TabPanels>
                  </Paper>
                </Tabs>
              </SafeTabPanel>
              <SafeTabPanel index={3}>
                <FromImageContent
                  variant={'private'}
                  imagePanelTitle="Choose an Image"
                  imagesData={imagesData}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={4}>
                <FromBackupsContent
                  errors={errors}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...restoreBackup}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={5}>
                <FromLinodeContent
                  errors={errors}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>

          {this.props.createType !== 'fromBackup' && (
            <SelectRegionPanel
              data-qa-select-region-panel
              error={hasErrorFor.region}
              regions={regionsData!}
              handleSelection={this.props.updateRegionID}
              selectedID={this.props.selectedRegionID}
              copy="Determine the best location for your Linode."
              updateFor={[this.props.selectedRegionID, regionsData, errors]}
              disabled={userCannotCreateLinode}
              helperText={this.props.regionHelperText}
            />
          )}
          <SelectPlanPanel
            data-qa-select-plan
            error={hasErrorFor.type}
            types={filterCurrentTypes(typesData)!}
            onSelect={this.props.updateTypeID}
            selectedID={this.props.selectedTypeID}
            updateFor={[
              this.props.selectedTypeID,
              this.props.disabledClasses,
              errors
            ]}
            disabled={userCannotCreateLinode}
            disabledClasses={this.props.disabledClasses}
            isCreate
          />
          <LabelAndTagsPanel
            data-qa-label-and-tags-panel
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: updateLabel,
              errorText: hasErrorFor.label,
              disabled: userCannotCreateLinode
            }}
            tagsInputProps={
              this.props.createType !== 'fromLinode'
                ? tagsInputProps
                : undefined
            }
            updateFor={[tags, label, errors]}
          />
          {/* Hide for backups and clone */}
          {!['fromBackup', 'fromLinode'].includes(this.props.createType) && (
            <AccessPanel
              data-qa-access-panel
              disabled={!this.props.selectedImageID || userCannotCreateLinode}
              disabledReason={
                !this.props.selectedImageID
                  ? 'You must select an image to set a root password'
                  : ''
              }
              error={hasErrorFor.root_pass}
              sshKeyError={sshError}
              password={this.props.password}
              handleChange={this.props.updatePassword}
              updateFor={[
                this.props.password,
                errors,
                sshError,
                userSSHKeys,
                this.props.selectedImageID,
                userCannotCreateLinode
              ]}
              users={userSSHKeys}
              requestKeys={requestKeys}
            />
          )}
          <AddonsPanel
            data-qa-addons-panel
            backups={this.props.backupsEnabled}
            accountBackups={accountBackupsEnabled}
            backupsMonthly={backupsMonthlyPrice}
            privateIP={this.props.privateIPEnabled}
            changeBackups={this.props.toggleBackupsEnabled}
            changePrivateIP={this.props.togglePrivateIPEnabled}
            disabled={userCannotCreateLinode}
            hidePrivateIP={this.props.createType === 'fromLinode'}
            changeSelectedVLAN={this.props.setVlanID}
            selectedVlanIDs={this.props.selectedVlanIDs}
            selectedRegionID={this.props.selectedRegionID}
            vlanError={hasErrorFor.interfaces}
          />
        </Grid>
        <Grid item className="mlSidebar">
          <CheckoutBar
            data-qa-checkout-bar
            heading="Linode Summary"
            calculatedPrice={calculatedPrice}
            isMakingRequest={this.props.formIsSubmitting}
            disabled={this.props.formIsSubmitting || userCannotCreateLinode}
            onDeploy={this.createLinode}
            footer={
              <SMTPRestrictionText>
                {({ text }) => <div style={{ marginTop: 16 }}>{text}</div>}
              </SMTPRestrictionText>
            }
          >
            <DisplaySectionList displaySections={displaySections} />
          </CheckoutBar>
          {this.props.createType === 'fromApp' &&
            this.props.documentation.length > 0 && (
              <DocsSidebar docs={this.props.documentation} />
            )}
        </Grid>
      </form>
    );
  }
}

interface DispatchProps {
  setTab: (value: CreateTypes) => void;
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  CombinedProps
> = dispatch => ({
  setTab: value => dispatch(handleChangeCreateType(value))
});

interface StateProps {
  documentation: Linode.Doc[];
}

const mapStateToProps: MapStateToProps<
  StateProps,
  CombinedProps,
  ApplicationState
> = state => ({
  documentation: state.documentation
});

const generateDocs = (ownProps: InnerProps & StateProps) => {
  const { selectedStackScriptLabel } = ownProps;
  if (!!selectedStackScriptLabel) {
    const foundDocs = AppsDocs.filter(eachDoc => {
      return eachDoc.title
        .toLowerCase()
        .includes(
          selectedStackScriptLabel
            .substr(0, selectedStackScriptLabel.indexOf(' '))
            .toLowerCase()
        );
    });
    return foundDocs.length ? foundDocs : [];
  }
  return [];
};

const updateCond = (
  prevProps: InnerProps & StateProps,
  nextProps: InnerProps & StateProps
) => {
  return prevProps.selectedStackScriptID !== nextProps.selectedStackScriptID;
};

const styled = withStyles(styles);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = recompose<CombinedProps, InnerProps>(
  connected,
  styled,
  setDocs(generateDocs, updateCond)
);

export default enhanced(LinodeCreate);
