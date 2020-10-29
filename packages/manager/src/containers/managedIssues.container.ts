import { ManagedIssue } from '@linode/api-v4/lib/managed';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { requestManagedIssues as _requestManagedIssues } from 'src/store/managed/issues.requests';
import { EntityError } from 'src/store/types';

export interface ManagedIssuesProps {
  issues: ManagedIssue[];
  issuesLoading: boolean;
  issuesError: EntityError;
  issuesLastUpdated: number;
}

export interface DispatchProps {
  requestManagedIssues: () => Promise<any>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestManagedIssues: () => {
    console.count('requesting-issues');
    return dispatch(_requestManagedIssues());
  }
});

export default <TInner extends {}, TOuter extends {}>(
  mapManagedIssuesToProps?: (
    ownProps: TOuter,
    issuesLoading: boolean,
    issuesLastUpdated: number,
    issues: ManagedIssue[],
    issuesError?: EntityError
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const issues = Object.values(state.__resources.managedIssues.itemsById);
    const issuesLoading = state.__resources.managedIssues.loading;
    const issuesError = state.__resources.managedIssues.error;
    const issuesLastUpdated = state.__resources.managedIssues.lastUpdated;

    if (mapManagedIssuesToProps) {
      return mapManagedIssuesToProps(
        ownProps,
        issuesLoading,
        issuesLastUpdated,
        issues,
        issuesError
      );
    }

    return { issuesLoading, issuesLastUpdated, issues, issuesError };
  }, mapDispatchToProps);
