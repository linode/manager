import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import compact from 'lodash/compact';
import curry from 'lodash/curry';
import { assocPath } from 'ramda';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import Select, { Item } from 'src/components/EnhancedSelect';
import { IconButton } from 'src/components/IconButton';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { APP_ROOT } from 'src/constants';
import { ImageEmptyState } from 'src/features/Linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import { AppDetailDrawer } from 'src/features/OneClickApps';
import {
  AppCategory,
  oneClickApps,
} from 'src/features/OneClickApps/oneClickApps';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { sendMarketplaceSearchEvent } from 'src/utilities/analytics';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { initializePercentageCounter } from 'src/utilities/percentageCounter';

import SelectAppPanel from '../SelectAppPanel';
import {
  AppsData,
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages,
} from '../types';
import { StyledGrid } from './CommonTabbedContent.styles';
import { filterUDFErrors } from './formUtilities';

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

const errorResources = {
  image: 'Image',
  label: 'A label',
  region: 'A region selection',
  root_pass: 'A root password',
  stackscript_id: 'The selected App',
  tags: 'Tags',
  type: 'A plan selection',
};

interface Props {
  setNumberOfNodesForAppCluster: (num: number) => void;
}

type CombinedProps = Props &
  AppsData &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

interface State {
  categoryFilter: Item<AppCategory> | null;
  detailDrawerOpen: boolean;
  filteredApps: CombinedProps['appInstances'];
  isFiltering: boolean;
  isSearching: boolean;
  percentageCounter: number;
  query: string;
  selectedScriptForDrawer: string;
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
      alt={`${selectedStackScriptLabel} logo`}
      src={`${APP_ROOT}/${logoUrl.toLowerCase()}`}
    />
  );
};

const curriedHandleSelectStackScript = curry(handleSelectStackScript);

export class FromAppsContent extends React.Component<CombinedProps, State> {
  componentDidMount() {
    this.percentageCounter.startAnimation(this.updatePercentage);
  }

  componentWillUnmount() {
    this.percentageCounter.stopAnimation();
  }

  render() {
    const {
      appInstances,
      appInstancesError,
      appInstancesLoading,
      availableStackScriptImages: compatibleImages,
      availableUserDefinedFields: userDefinedFields,
      errors,
      selectedImageID,
      selectedStackScriptID,
      selectedStackScriptLabel,
      selectedUDFs: udf_data,
      setNumberOfNodesForAppCluster,
      updateImageID,
      userCannotCreateLinode,
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

    const handleSearchFieldClick = () => {
      sendMarketplaceSearchEvent('Search Field');
    };

    const handleClearSearch = () => {
      this.setState({
        isSearching: false,
        query: '',
      });
    };

    const logoUrl = appInstances?.find(
      (app) => app.id === selectedStackScriptID
    )?.logo_url;

    const appLogo = renderLogo(selectedStackScriptLabel, logoUrl);

    const {
      categoryFilter,
      filteredApps,
      isFiltering,
      isSearching,
      percentageCounter,
      query,
    } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <StyledGrid>
          <Paper>
            <Typography variant="h2">Select an App</Typography>
            <Grid
              sx={{
                marginTop: 0.5,
              }}
              container
              spacing={2}
            >
              <Grid
                sx={{
                  '& .MuiInputBase-root': {
                    maxWidth: '100%',
                  },
                  flexGrow: 1,
                }}
              >
                <DebouncedSearchTextField
                  InputProps={
                    isSearching
                      ? {
                          endAdornment: (
                            <IconButton
                              onClick={handleClearSearch}
                              sx={{ padding: '2px 4px' }}
                            >
                              <Close />
                            </IconButton>
                          ),
                        }
                      : undefined
                  }
                  placeholder={
                    appInstancesLoading
                      ? `Loading... ${percentageCounter.toFixed(0)}%`
                      : 'Search for app name'
                  }
                  sx={
                    appInstancesLoading
                      ? {
                          '& .MuiInput-input::placeholder': {
                            opacity: 1,
                          },
                          '& input': {
                            cursor: 'not-allowed',
                          },
                          '& svg': {
                            opacity: 0.5,
                          },
                        }
                      : null
                  }
                  debounceTime={250}
                  disabled={appInstancesLoading}
                  fullWidth
                  hideLabel
                  label="Search marketplace"
                  onClick={handleSearchFieldClick}
                  onSearch={this.onSearch}
                  value={query}
                />
              </Grid>
              <Grid sx={{ minWidth: 225 }}>
                <Select
                  placeholder={
                    appInstancesLoading ? 'Loading...' : 'Select category'
                  }
                  disabled={appInstancesLoading}
                  hideLabel
                  label="Select category"
                  onChange={this.handleSelectCategory}
                  options={appCategoryOptions}
                  value={categoryFilter}
                />
              </Grid>
            </Grid>
          </Paper>
          <SelectAppPanel
            appInstances={
              isSearching || isFiltering ? filteredApps : appInstances
            }
            appInstancesError={appInstancesError}
            appInstancesLoading={appInstancesLoading}
            disabled={userCannotCreateLinode}
            error={hasErrorFor('stackscript_id')}
            handleClick={handleSelectStackScript}
            isFiltering={isFiltering}
            isSearching={isSearching}
            openDrawer={this.openDrawer}
            searchValue={query}
            selectedStackScriptID={selectedStackScriptID}
          />
          {!userCannotCreateLinode && selectedStackScriptLabel ? (
            <UserDefinedFieldsPanel
              updateFor={[
                selectedStackScriptID,
                userDefinedFields,
                udf_data,
                errors,
              ]}
              appLogo={appLogo}
              errors={filterUDFErrors(errorResources, errors)}
              handleChange={this.handleChangeUDF}
              openDrawer={this.openDrawer}
              selectedLabel={selectedStackScriptLabel}
              selectedUsername="Linode"
              setNumberOfNodesForAppCluster={setNumberOfNodesForAppCluster}
              udf_data={udf_data || {}}
              userDefinedFields={userDefinedFields}
            />
          ) : null}
          {!userCannotCreateLinode &&
          compatibleImages &&
          compatibleImages.length > 0 ? (
            <ImageSelect
              error={hasErrorFor('image')}
              handleSelectImage={updateImageID}
              images={compatibleImages}
              selectedImageID={selectedImageID}
              title="Select an Image"
              variant="public"
            />
          ) : (
            <ImageEmptyState errorText={hasErrorFor('image')} />
          )}
        </StyledGrid>

        <AppDetailDrawer
          onClose={this.closeDrawer}
          open={this.state.detailDrawerOpen}
          stackScriptLabel={this.state.selectedScriptForDrawer}
        />
      </React.Fragment>
    );
  }

  closeDrawer = () => {
    this.setState({
      detailDrawerOpen: false,
    });
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.props.selectedUDFs);

    this.props.handleSelectUDFs({ ...this.props.selectedUDFs, ...newUDFData });
  };

  handleSelectCategory = (categoryItem: Item<AppCategory>) => {
    const didUserSelectCategory = categoryItem !== null;
    let instancesInCategory: StackScript[] | undefined = [];
    if (didUserSelectCategory) {
      sendMarketplaceSearchEvent('Category Dropdown', categoryItem.label);
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
      filteredApps: didUserSelectCategory ? instancesInCategory : [],
      isFiltering: didUserSelectCategory,
      isSearching: false,
      query: '',
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
        (acc: string[], { alt_description, alt_name, categories, name }) => {
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
        categoryFilter: null,
        filteredApps: appsMatchingQuery,
        isFiltering: false,
        isSearching: true,
        query,
      });
    }
  };

  openDrawer = (stackScriptLabel: string) => {
    this.setState({
      detailDrawerOpen: true,
      selectedScriptForDrawer: stackScriptLabel,
    });
  };

  //
  percentageCounter = initializePercentageCounter(7000);

  state: State = {
    categoryFilter: null,
    detailDrawerOpen: false,
    filteredApps: [],
    isFiltering: false,
    isSearching: false,
    percentageCounter: 0,
    query: '',
    selectedScriptForDrawer: '',
  };

  updatePercentage = (newPercentage: number) => {
    this.setState({ percentageCounter: newPercentage });
  };
}
