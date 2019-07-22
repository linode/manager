import { connect } from 'react-redux';
import { ApplicationState } from '..';
import { State } from './linodeType.reducer';

export interface WithTypes {
  types: Linode.LinodeType[];
  typesError: Linode.ApiFieldError[];
  typesLastUpdated: number;
  typesLoading: boolean;
}

const defaultMapState = ({ entities, error, lastUpdated, loading }: State) => ({
  types: entities,
  typesError: error,
  typesLastUpdated: lastUpdated,
  typesLoading: loading
});

export const withTypes = (mapState: (s: State) => any = defaultMapState) =>
  connect((state: ApplicationState) => mapState(state.__resources.types));
