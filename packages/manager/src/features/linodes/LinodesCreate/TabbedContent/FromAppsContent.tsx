import compact from 'lodash/compact';
import curry from 'lodash/curry';
import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { assocPath } from 'ramda';
import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import ImageSelect from 'src/components/ImageSelect';
import ImageEmptyState from 'src/features/linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import { AppDetailDrawer } from 'src/features/OneClickApps';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import SelectAppPanel from '../SelectAppPanel';
import {
  AppsData,
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages,
} from '../types';
import { filterUDFErrors } from './formUtilities';
import { APP_ROOT } from 'src/constants';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import Select, { Item } from 'src/components/EnhancedSelect';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { oneClickApps, AppCategory } from 'src/features/OneClickApps/FakeSpec';
import { sendMarketplaceSearchEvent } from 'src/utilities/ga';

type ClassNames = 'main' | 'sidebar' | 'searchAndFilter' | 'search' | 'filter';

const appCategories = [
  'Control Panels',
  'Databases',
  'Development',
  'Games',
  'Media and Entertainment',
  'Monitoring',
  'Productivity',
  'Security',
  'Stacks',
  'Website',
  //   'App Creators',
];

const appCategoryOptions = appCategories.map((categoryName) => ({
  label: categoryName,
  value: categoryName,
}));

// type AppCategory = typeof appCategories;

const styles = (theme: Theme) =>
  createStyles({
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important',
      },
    },
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%',
      },
    },
    searchAndFilter: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: theme.spacing(),
      marginTop: theme.spacing(),
      '& > h2': {
        width: '100%',
      },
    },
    search: {
      flexGrow: 10,
      '& .input': {
        maxWidth: 'none',
      },
    },
    filter: {
      flexGrow: 1.5,
    },
  });

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags',
  stackscript_id: 'The selected App',
};

interface Props {
  setNumberOfNodesForAppCluster: (num: number) => void;
}

type InnerProps = Props &
  AppsData &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

type CombinedProps = WithStyles<ClassNames> & InnerProps;

interface State {
  detailDrawerOpen: boolean;
  selectedScriptForDrawer: string;
  filteredApps: CombinedProps['appInstances'];
  isSearching: boolean;
  isFiltering: boolean;
  query: string;
  categoryFilter: Item<AppCategory> | null;
}

export const getCompatibleImages = (
  imagesData: Record<string, Image>,
  stackScriptImages: string[]
) =>
  compact(
    stackScriptImages.map((stackScriptImage) => imagesData[stackScriptImage])
  );

export const getDefaultUDFData = (userDefinedFields: UserDefinedField[]) => {
  return userDefinedFields.reduce((accum, eachField) => {
    if (eachField.default) {
      accum[eachField.name] = eachField.default;
    }
    return accum;
  }, {});
};

export const handleSelectStackScript = (
  id: number,
  label: string,
  username: string,
  stackScriptImages: string[],
  userDefinedFields: UserDefinedField[],
  imagesData: Record<string, Image>,
  updateStackScript: CombinedProps['updateStackScript']
) => {
  const compatibleImages = getCompatibleImages(imagesData, stackScriptImages);
  const defaultUDFData = getDefaultUDFData(userDefinedFields);
  updateStackScript(
    id,
    label,
    username,
    userDefinedFields,
    compatibleImages,
    defaultUDFData
  );
};

const renderLogo = (selectedStackScriptLabel?: string, logoUrl?: string) => {
  return logoUrl === undefined ? (
    <span className="fl-tux" />
  ) : (
    <img
      src={`${APP_ROOT}/${logoUrl.toLowerCase()}`}
      alt={`${selectedStackScriptLabel} logo`}
    />
  );
};

const curriedHandleSelectStackScript = curry(handleSelectStackScript);

class FromAppsContent extends React.Component<CombinedProps, State> {
  state: State = {
    detailDrawerOpen: false,
    selectedScriptForDrawer: '',
    filteredApps: [],
    isSearching: false,
    query: '',
    categoryFilter: null,
    isFiltering: false,
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.props.selectedUDFs);

    this.props.handleSelectUDFs({ ...this.props.selectedUDFs, ...newUDFData });
  };

  openDrawer = (stackScriptLabel: string) => {
    this.setState({
      detailDrawerOpen: true,
      selectedScriptForDrawer: stackScriptLabel,
    });
  };

  closeDrawer = () => {
    this.setState({
      detailDrawerOpen: false,
    });
  };

  onSearch = (query: string) => {
    if (query === '' || query.trim().length === 0) {
      this.setState({ isSearching: false });
    } else {
      /**
       * Enable ability to search OCA's by category, name, alternative name and
       * alternative description keywords.
       * */
      const queryWords = query
        .replace(/[,.-]/g, '')
        .trim()
        .toLocaleLowerCase()
        .split(' ');

      const matchingOCALabels = oneClickApps.reduce(
        (acc: string[], { categories, name, alt_name, alt_description }) => {
          const ocaAppString = `${name} ${alt_name} ${categories.join(
            ' '
          )} ${alt_description}`.toLocaleLowerCase();

          const hasMatchingOCA = queryWords.every((queryWord) =>
            ocaAppString.includes(queryWord)
          );

          if (hasMatchingOCA) {
            acc.push(name.trim());
          }

          return acc;
        },
        []
      );

      const appsMatchingQuery = this.props.appInstances?.filter((instance) => {
        return matchingOCALabels.includes(instance.label.trim());
      });

      this.setState({
        isFiltering: false,
        filteredApps: appsMatchingQuery,
        isSearching: true,
        categoryFilter: null,
        query,
      });
    }
  };

  handleSelectCategory = (categoryItem: Item<AppCategory>) => {
    const didUserSelectCategory = categoryItem !== null;
    let instancesInCategory: StackScript[] | undefined = [];
    if (didUserSelectCategory) {
      sendMarketplaceSearchEvent(categoryItem.label);
      const appsInCategory = oneClickApps.filter((oca) =>
        oca.categories?.includes(categoryItem.value)
      );
      const appLabels = appsInCategory.map((app) => app.name.trim());
      instancesInCategory = this.props.appInstances?.filter((instance) => {
        return appLabels.includes(instance.label.trim());
      });
    }
    this.setState({
      categoryFilter: categoryItem,
      isSearching: false,
      query: '',
      filteredApps: didUserSelectCategory ? instancesInCategory : [],
      isFiltering: didUserSelectCategory,
    });
  };

  render() {
    const {
      classes,
      selectedImageID,
      selectedStackScriptID,
      selectedStackScriptLabel,
      selectedUDFs: udf_data,
      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: compatibleImages,
      updateImageID,
      errors,
      appInstances,
      appInstancesError,
      appInstancesLoading,
      userCannotCreateLinode,
      setNumberOfNodesForAppCluster,
    } = this.props;

    // ramda's curry placeholder conflicts with lodash so the lodash curry and placeholder is used here
    const handleSelectStackScript = curriedHandleSelectStackScript(
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      this.props.imagesData,
      this.props.updateStackScript
    );

    const logoUrl = appInstances?.find(
      (app) => app.id === selectedStackScriptID
    )?.logo_url;

    const appLogo = renderLogo(selectedStackScriptLabel, logoUrl);

    const {
      filteredApps,
      isSearching,
      query,
      categoryFilter,
      isFiltering,
    } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <Grid className={`${classes.main} mlMain py0`}>
          <Paper>
            <Typography variant="h2">Select an App</Typography>
            <Box className={classes.searchAndFilter}>
              <Box className={classes.search}>
                <DebouncedSearchTextField
                  placeholder="Search for app name"
                  fullWidth
                  onSearch={this.onSearch}
                  label="Search marketplace"
                  hideLabel
                  value={query}
                />
              </Box>
              <Box className={classes.filter}>
                <Select
                  label="Select category"
                  placeholder="Select category"
                  options={appCategoryOptions}
                  onChange={this.handleSelectCategory}
                  value={categoryFilter}
                  hideLabel
                />
              </Box>
            </Box>
          </Paper>
          <SelectAppPanel
            appInstances={
              isSearching || isFiltering ? filteredApps : appInstances
            }
            appInstancesError={appInstancesError}
            appInstancesLoading={appInstancesLoading}
            selectedStackScriptID={selectedStackScriptID}
            disabled={userCannotCreateLinode}
            handleClick={handleSelectStackScript}
            openDrawer={this.openDrawer}
            error={hasErrorFor('stackscript_id')}
            isSearching={isSearching}
            isFiltering={isFiltering}
            searchValue={query}
          />
          {!userCannotCreateLinode && selectedStackScriptLabel ? (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(errorResources, errors)}
              selectedLabel={selectedStackScriptLabel}
              selectedUsername="Linode"
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[
                selectedStackScriptID,
                userDefinedFields,
                udf_data,
                errors,
              ]}
              udf_data={udf_data || {}}
              appLogo={appLogo}
              openDrawer={this.openDrawer}
              setNumberOfNodesForAppCluster={setNumberOfNodesForAppCluster}
            />
          ) : null}
          {!userCannotCreateLinode &&
          compatibleImages &&
          compatibleImages.length > 0 ? (
            <ImageSelect
              title="Select an Image"
              images={compatibleImages}
              handleSelectImage={updateImageID}
              selectedImageID={selectedImageID}
              error={hasErrorFor('image')}
              variant="public"
            />
          ) : (
            <ImageEmptyState errorText={hasErrorFor('image')} />
          )}
        </Grid>

        <AppDetailDrawer
          open={this.state.detailDrawerOpen}
          stackScriptLabel={this.state.selectedScriptForDrawer}
          onClose={this.closeDrawer}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromAppsContent);
