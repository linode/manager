import * as React from 'react';
import { pathOr } from 'ramda';
import { connect, MapDispatchToProps } from 'react-redux';
import CheckoutBar, { DisplaySectionList } from 'src/components/CheckoutBar';
import { compose as recompose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
// import DocsSidebar from 'src/components/DocsSidebar';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import { WithImages } from 'src/containers/withImages.container';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';
import {
  CreateTypes,
  handleChangeCreateType
} from 'src/store/linodeCreate/linodeCreate.actions';
import { getInitialType } from 'src/store/linodeCreate/linodeCreate.reducer';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import AddonsPanel from './AddonsPanel';
import SelectPlanPanel from './SelectPlanPanel';
import FromAppsContent from './TabbedContent/FromAppsContent';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import { RouteComponentProps } from 'react-router-dom';
import {
  AllFormStateAndHandlers,
  AppsData,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps
} from './types';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Typography from 'src/components/core/Typography';
import TabLinkList, { Tab } from 'src/components/TabLinkList';
// import { AppsDocs } from 'src/documentation';
import { renderBackupsDisplaySection } from './TabbedContent/utils';
import { restoreBackup } from '@linode/api-v4/lib/linodes';

type ClassNames = 'root' | 'form' | 'stackScriptWrapper' | 'imageSelect';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F4F4F4',

      '& > :first-child': {
        padding: 0
      }
    },
    form: {
      display: 'flex'
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
}

const errorMap = [
  'backup_id',
  'linode_id',
  'stackscript_id',
  'region',
  'type',
  'root_pass',
  'label',
  'image'
];

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithImages &
  WithLinodesProps &
  WithRegionsProps &
  WithTypesProps &
  WithDisplayData &
  AppsData &
  ReduxStatePropsAndSSHKeys &
  AllFormStateAndHandlers &
  RouteComponentProps<{}>;

interface State {
  selectedTab: number;
}

export class LinodeCreate extends React.PureComponent<
  CombinedProps & DispatchProps,
  State
> {
  constructor(props: CombinedProps & DispatchProps) {
    super(props);

    /** get the query params as an object, excluding the "?" */
    const queryParams = getParamsFromUrl(location.search);

    /** will be -1 if the query param is not found */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const preSelectedTab = this.tabs.findIndex((eachTab, index) => {
      return eachTab.title === queryParams.type;
    });

    // If there is no specified "type" in the query params, update the Redux state
    // so that the correct request is made when the form is submitted.
    // if (!queryParams.type) {
    //   this.props.setTab(this.tabs[0].type);
    // }

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0
    };
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.setTab(getInitialType());
  }

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    this.props.resetCreationState();

    /** set the tab in redux state */
    // this.props.setTab(this.tabs[value].type);

    this.props.history.push({
      search: `?type=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  tabs: Tab[] = [
    {
      title: 'Distributions',
      type: 'fromImage',
      routeName: `${this.props.match.url}?type=Distributions`
    },
    {
      title: 'Marketplace',
      type: 'fromApp',
      routeName: `${this.props.match.url}?type=Marketplace`
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
      routeName: `${this.props.match.url}?type=Clones`
    }
  ];

  stackScriptTabs: Tab[] = [
    {
      title: 'Community StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts/Community`
    },
    {
      title: 'Account StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts/Account`
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  createLinode = () => {
    this.props.handleSubmitForm({
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
      private_ip: this.props.privateIPEnabled,

      // StackScripts
      stackscript_id: this.props.selectedStackScriptID,
      stackscript_data: this.props.selectedUDFs
    });
  };

  render() {
    const { selectedTab } = this.state;

    const {
      classes,
      regionsLoading,
      imagesLoading,
      linodesLoading,
      imagesError,
      regionsError,
      linodesError,
      typesError,
      typesLoading,
      regionsData,
      typesData,
      imagesData,
      label,
      linodesData,
      updateLabel,
      tags,
      updateTags,
      errors,
      sshError,
      userSSHKeys,
      requestKeys,
      backupsMonthlyPrice,
      userCannotCreateLinode,
      // location,
      typeDisplayInfo,
      regionDisplayInfo,
      imageDisplayInfo,
      accountBackupsEnabled,

      // StackScripts
      // selectedStackScriptID,
      // selectedUDFs,
      ...rest
    } = this.props;

    const hasErrorFor = getErrorMap(errorMap, errors);

    if (regionsLoading || imagesLoading || linodesLoading || typesLoading) {
      return <CircleProgress />;
    }

    if (regionsError || imagesError.read || linodesError || typesError) {
      return (
        <ErrorState errorText="There was an issue loading Linode creation options." />
      );
    }

    if (
      !this.props.regionsData ||
      !this.props.imagesData ||
      !this.props.linodesData ||
      !this.props.typesData
    ) {
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

    if (this.props.label) {
      displaySections.push({
        title: 'Linode Label',
        details: this.props.label
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
          <Tabs defaultIndex={selectedTab}>
            <TabLinkList tabs={this.tabs} />
            <TabPanels>
              <SafeTabPanel index={0}>
                <FromImageContent
                  variant="public"
                  imagePanelTitle="Choose a Distribution"
                  showGeneralError={true}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <FromAppsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <Tabs defaultIndex={0}>
                  <Paper className={classes.stackScriptWrapper}>
                    <Typography variant="h2">Create From:</Typography>
                    <TabLinkList tabs={this.stackScriptTabs} />
                    <TabPanels className={classes.imageSelect}>
                      <SafeTabPanel index={0}>
                        <FromStackScriptContent
                          category="community"
                          accountBackupsEnabled={
                            this.props.accountBackupsEnabled
                          }
                          userCannotCreateLinode={
                            this.props.userCannotCreateLinode
                          }
                          request={getCommunityStackscripts}
                          header={'Select a StackScript'}
                          imagesData={imagesData!}
                          regionsData={regionsData!}
                          typesData={typesData!}
                          {...rest}
                        />
                      </SafeTabPanel>
                      <SafeTabPanel index={1}>
                        <FromStackScriptContent
                          category="account"
                          accountBackupsEnabled={
                            this.props.accountBackupsEnabled
                          }
                          userCannotCreateLinode={
                            this.props.userCannotCreateLinode
                          }
                          request={getMineAndAccountStackScripts}
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
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={4}>
                <FromBackupsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  {...restoreBackup}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={5}>
                <FromLinodeContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>

          <SelectRegionPanel
            error={hasErrorFor.region}
            regions={regionsData!}
            handleSelection={this.props.updateRegionID}
            selectedID={this.props.selectedRegionID}
            copy="Determine the best location for your Linode."
            updateFor={[this.props.selectedRegionID, regionsData, errors]}
            disabled={userCannotCreateLinode}
          />
          <SelectPlanPanel
            error={hasErrorFor.type}
            types={typesData!}
            onSelect={this.props.updateTypeID}
            selectedID={this.props.selectedTypeID}
            updateFor={[
              this.props.selectedTypeID,
              this.props.disabledClasses,
              errors
            ]}
            disabled={userCannotCreateLinode}
            disabledClasses={this.props.disabledClasses}
          />
          <LabelAndTagsPanel
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
          <AccessPanel
            disabled={!this.props.selectedImageID}
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
              this.props.selectedImageID
            ]}
            users={userSSHKeys}
            requestKeys={requestKeys}
          />
          <AddonsPanel
            data-qa-addons-panel
            backups={this.props.backupsEnabled}
            accountBackups={this.props.accountBackupsEnabled}
            backupsMonthly={backupsMonthlyPrice}
            privateIP={this.props.privateIPEnabled}
            changeBackups={this.props.toggleBackupsEnabled}
            changePrivateIP={this.props.togglePrivateIPEnabled}
            updateFor={[
              this.props.privateIPEnabled,
              this.props.backupsEnabled,
              this.props.selectedTypeID
            ]}
            disabled={userCannotCreateLinode}
            hidePrivateIP={this.props.createType === 'fromLinode'}
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
          >
            <DisplaySectionList displaySections={displaySections} />
          </CheckoutBar>
          {/* { && <div>test</div>
          // <DocsSidebar docs={this.props.documentation} />
          } */}
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

const styled = withStyles(styles);

const connected = connect(undefined, mapDispatchToProps);

const enhanced = recompose<CombinedProps, {}>(connected, styled);

export default enhanced(LinodeCreate);
