import { LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from '..';
import { State } from './linodeType.reducer';

export interface WithTypes {
  types: LinodeType[];
  typesError: APIError[];
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
