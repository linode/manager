import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import withAccountSettings, {
  DispatchProps as SettingsDispatchProps,
  SettingsProps
} from 'src/containers/accountSettings.container';
import useFlags from 'src/hooks/useFlags';
import ManagedLandingContent from './ManagedLandingContent';
import ManagedPlaceholder from './ManagedPlaceholder';

export type CombinedProps = SettingsProps &
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

  const renderContent = () => {
    // Loading and error states
    if (accountSettingsLoading && accountSettingsLastUpdated === 0) {
      return <CircleProgress />;
    }

    if (accountSettingsError.read) {
      return <ErrorState errorText={accountSettingsError.read[0].reason} />;
    }

    if (!flags.managed) {
      return <ManagedPlaceholder />;
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
  withAccountSettings()
);

export default enhanced(ManagedLanding);
