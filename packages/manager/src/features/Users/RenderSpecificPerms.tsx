import {
  Grant,
  GrantLevel,
  GrantType,
  Grants,
  updateGrants,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { omit } from 'ramda';
import * as React from 'react';

import Select from 'src/components/EnhancedSelect/Select';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Paper } from 'src/components/Paper';
import { Tab } from 'src/components/ReachTab';
import { TabList } from 'src/components/ReachTabList';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { renderActions } from './UserPermissions';
import { TabInfo } from './UserPermissions';
import { UserPermissionsEntitySection } from './UserPermissionsEntitySection';
import { PermSelectValue } from './userPermissionsReducer';
import { Action, UserGrantsState } from './userPermissionsReducer';
import {
  entityNameMap,
  entityPerms,
  getTabInformation,
  permOptions,
} from './userPermissionsUtils';

interface RenderSpecificPermsProps {
  cancelPermsType: (str: string) => void;
  dispatch: React.Dispatch<Action>;
  setErrors: React.Dispatch<React.SetStateAction<APIError[] | undefined>>;
  setTabInfo: React.Dispatch<React.SetStateAction<TabInfo | undefined>>;
  state: UserGrantsState;
  tabInfo?: TabInfo;
  username?: string;
}

export const RenderSpecificPerms = (props: RenderSpecificPermsProps) => {
  const {
    cancelPermsType,
    dispatch,
    setErrors,
    setTabInfo,
    state,
    tabInfo,
    username,
  } = props;
  // null needs to be a string here because it's a Select value
  const [
    masterSpecificPermsValue,
    setMasterSpecificPermsValue,
  ] = React.useState<PermSelectValue>('null');
  const [isSavingEntity, setIsSavingEntity] = React.useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const defaultPerm = permOptions.find((eachPerm) => {
    return eachPerm.value === masterSpecificPermsValue;
  });

  const setAllEntitiesTo = (e: Item<string>) => {
    const value = e.value === 'null' ? null : e.value;
    entityPerms.map((entity: GrantType) =>
      entitySetAllTo(entity, value as GrantLevel)
    );

    setMasterSpecificPermsValue(e.value as PermSelectValue);
  };

  const setGrantTo = (entity: string, idx: number, value: GrantLevel) => {
    if (!state.grants?.[entity]) {
      return;
    }

    dispatch({ entity, idx, type: 'SPECIFIC_PERM_CHANGED', value });
  };

  const entitySetAllTo = (entity: GrantType, value: GrantLevel) => {
    if (!state.grants?.[entity]) {
      return;
    }

    // map entities to an array for state updates
    const changedEntitiesMap = state.grants[entity].map((idx: Grant) => {
      return { ...idx };
    });

    // compose all of the update functions and setState
    if (changedEntitiesMap.length) {
      for (let i = 0; i < changedEntitiesMap.length; i++) {
        changedEntitiesMap[i].permissions = value;
      }
      dispatch({
        entity,
        entityPerms: changedEntitiesMap,
        type: 'ALL_SPECIFIC_PERMS_CHANGED',
      });
    }
  };

  const saveSpecificGrants = () => {
    setIsSavingEntity(true);
    setErrors(undefined);

    if (!username || !state?.grants) {
      setIsSavingEntity(false);
      return setErrors([
        {
          reason: `Can\'t set entity-specific permissions at this time. Please try again later`,
        },
      ]);
    }

    // You would think ramda could do a TS omit, but I guess not
    const requestPayload = (omit(['global'], state.grants) as unknown) as Omit<
      Grants,
      'global'
    >;
    updateGrants(username, requestPayload)
      .then((grantsResponse) => {
        // In the chance a new type entity was added to the account, re-calculate what tabs need to be shown.
        const { showTabs, tabs } = getTabInformation(grantsResponse);
        setTabInfo({ showTabs, tabs });
        setIsSavingEntity(false);
        // build array for state updates
        const entityPermsMap = entityPerms.map((entity) => [
          entity,
          grantsResponse[entity],
        ]);
        const resetEntityPermsObj = Object.fromEntries(entityPermsMap);
        // apply all of them at once
        for (const entityItem in resetEntityPermsObj) {
          dispatch({
            entity: entityItem,
            type: 'SPECIFIC_PERMS_SAVED',
            value: resetEntityPermsObj[entityItem],
          });
        }
        enqueueSnackbar('Successfully saved entity-specific permissions', {
          variant: 'success',
        });
      })
      .catch((errResponse) => {
        setIsSavingEntity(false);
        setErrors(
          getAPIErrorOrDefault(
            errResponse,
            'Error while updating entity-specific permissions for this user. Please try again later'
          )
        );
        scrollErrorIntoView();
      });
  };

  return (
    <Paper
      data-qa-entity-section
      sx={(theme) => ({ marginTop: theme.spacing(2) })}
    >
      <Grid alignItems="center" container justifyContent="space-between">
        <Grid>
          <Typography
            data-qa-permissions-header="Specific Permissions"
            variant="h2"
          >
            Specific Permissions
          </Typography>
        </Grid>
        <Grid style={{ marginTop: 5 }}>
          <StyledSelect
            defaultValue={defaultPerm}
            id="setall"
            inline
            isClearable={false}
            label="Set all permissions to:"
            name="setall"
            noMarginTop
            onChange={setAllEntitiesTo}
            options={permOptions}
            small
          />
        </Grid>
      </Grid>
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
      >
        {tabInfo?.showTabs ? (
          <Tabs>
            <TabList>
              {tabInfo.tabs?.map((entity) => (
                <Tab key={`${entity}-tab`}>{entityNameMap[entity]}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {tabInfo.tabs.map((entity: GrantType, idx) => (
                <SafeTabPanel index={idx} key={`${entity}-tab-content`}>
                  <UserPermissionsEntitySection
                    entity={entity}
                    entitySetAllTo={entitySetAllTo}
                    grants={state.grants[entity]}
                    key={entity}
                    setGrantTo={setGrantTo}
                  />
                </SafeTabPanel>
              ))}
            </TabPanels>
          </Tabs>
        ) : state.grants ? (
          entityPerms.map((entity: GrantType) => (
            <UserPermissionsEntitySection
              entity={entity}
              entitySetAllTo={entitySetAllTo}
              grants={state.grants?.[entity]}
              key={entity}
              setGrantTo={setGrantTo}
              showHeading
            />
          ))
        ) : null}
      </Box>
      {renderActions(
        () => saveSpecificGrants(),
        () => cancelPermsType('entity'),
        isSavingEntity
      )}
    </Paper>
  );
};

const StyledSelect = styled(Select, {
  label: 'StyledSelect',
})(({ theme }) => ({
  '& .react-select__menu, & .input': {
    marginLeft: theme.spacing(1),
    right: 0,
    textAlign: 'left' as const,
    width: 125,
  },
  '& .react-select__menu-list': {
    width: '100%',
  },
  '& > div': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  '& label': {
    marginTop: 6,
  },
}));
