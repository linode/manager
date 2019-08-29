import { AccountSettings } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import withAccountSettings, {
  DispatchProps as SettingsDispatchProps
} from 'src/containers/accountSettings.container';
import useFlags from 'src/hooks/useFlags';
import EnableManagedPlaceholder from './EnableManagedPlaceholder';
import ManagedLandingContent from './ManagedLandingContent';
import ManagedPlaceholder from './ManagedPlaceholder';

export interface StateProps {
  accountSettings: AccountSettings;
  accountSettingsLoading: boolean;
  accountSettingsLastUpdated: number;
  accountSettingsError?: Linode.ApiFieldError[];
}

export type CombinedProps = StateProps &
  SettingsDispatchProps &
  RouteComponentProps<{}>;

const docs: Linode.Doc[] = [
  {
    title: 'Linode Managed',
    src: 'https://linode.com/docs/platform/linode-managed/',
    body: `How to configure service monitoring with Linode Managed.`
  }
];

export const ManagedLanding: React.FunctionComponent<CombinedProps> = props => {
  const {
    accountSettings,
    accountSettingsError,
    accountSettingsLastUpdated,
    accountSettingsLoading,
    ...routeComponentProps
  } = props;

  const flags = useFlags();
  const isManaged = false; // accountSettings && accountSettings.managed;

  /**
   * Temporary logic since we currently have 3 states:
   * 1. User is Managed but feature flag is off -> show existing placeholder to point them to Classic
   * 2. User is not Managed -> show new placeholder to enable Managed
   * 3. User is Managed & flag is on -> show ManagedLanding page
   */

  const renderContent = () => {
    // Loading and error states
    if (accountSettingsLoading && accountSettingsLastUpdated === 0) {
      return <CircleProgress />;
    }

    if (accountSettingsError) {
      return <ErrorState errorText={accountSettingsError[0].reason} />;
    }

    if (!flags.managed) {
      return <ManagedPlaceholder />;
    } else if (flags.managed && !isManaged) {
      // Eventually we can rename this to ManagedPlaceholder and delete the existing one
      return (
        <EnableManagedPlaceholder update={props.updateAccountSettingsInStore} />
      );
    }
    return <ManagedLandingContent {...routeComponentProps} />;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      {renderContent()}
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, {}>(
  setDocs(docs),
  withAccountSettings(
    (
      ownProps,
      accountSettingsLoading,
      accountSettingsLastUpdated,
      accountSettingsError,
      accountSettings
    ) => ({
      ...ownProps,
      accountSettings,
      accountSettingsLoading,
      accountSettingsError,
      accountSettingsLastUpdated
    })
  )
);

export default enhanced(ManagedLanding);
