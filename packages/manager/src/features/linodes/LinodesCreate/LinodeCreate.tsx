import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import CircleProgress from 'src/components/CircleProgress';
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
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import AddonsPanel from './AddonsPanel';
import SelectPlanPanel from './SelectPlanPanel';
import FromAppsContent from './TabbedContent/FromAppsContent';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import { matchPath, RouteComponentProps } from 'react-router-dom';
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
import TabLinkList, { Tab } from 'src/components/TabLinkList';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F4F4F4',

      '& > :first-child': {
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
    console.log(value);
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
      routeName: `${this.props.match.url}?type=Distributions`
    },
    {
      title: 'Marketplace',
      routeName: `${this.props.match.url}?type=Marketplace`
    },
    {
      title: 'StackScripts',
      routeName: `${this.props.match.url}?type=StackScripts`
    },
    {
      title: 'Images',
      routeName: `${this.props.match.url}?type=Images`
    },
    {
      title: 'Backups',
      routeName: `${this.props.match.url}?type=Backups`
    },
    {
      title: 'Clones',
      routeName: `${this.props.match.url}?type=Clones`
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

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
      location,
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

    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    const tagsInputProps = {
      value: tags || [],
      onChange: updateTags,
      tagError: hasErrorFor.tags,
      disabled: userCannotCreateLinode
    };

    return (
      <React.Fragment>
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
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <FromAppsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <FromStackScriptContent
                  category="account"
                  accountBackupsEnabled={this.props.accountBackupsEnabled}
                  userCannotCreateLinode={this.props.userCannotCreateLinode}
                  request={getMineAndAccountStackScripts}
                  header={'Select a StackScript'}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={3}>
                <FromImageContent
                  //variant={'private'}
                  imagePanelTitle="Choose an Image"
                  imagesData={imagesData}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={4}>
                <FromBackupsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={5}>
                <FromLinodeContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
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
        <Grid item>test</Grid>
        {/* <Grid
          item
          className={
            'mlSidebar ' +
            (variant === 'private'
              ? classes.sidebarPrivate
              : classes.sidebarPublic)
          }
        >
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
        </Grid> */}
      </React.Fragment>
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
