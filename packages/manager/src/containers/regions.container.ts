import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface DefaultProps {
  regionsData: Linode.Region[];
  regionsError?: Linode.ApiFieldError[];
  regionsLoading: boolean;
  regionsLastUpdated: number;
}

const defaultMap: (p: InjectedProps) => DefaultProps = ({
  data,
  error,
  loading,
  lastUpdated
}) => ({
  regionsData: data,
  regionsError: error,
  regionsLoading: loading,
  regionsLastUpdated: lastUpdated
});

interface InjectedProps {
  data: Linode.Region[];
  error?: Linode.ApiFieldError[];
  loading: boolean;
  lastUpdated: number;
}

const mapStateToPropsFactory = <MappedProps>(
  updater: (v: InjectedProps) => MappedProps
) => (state: ApplicationState): MappedProps => {
  const {
    entities: data,
    loading,
    error,
    lastUpdated
  } = state.__resources.regions;

  return updater({ data, loading, error, lastUpdated });
};

const regionsContainer = <MappedProps>(
  updater: (v: InjectedProps) => DefaultProps | MappedProps = defaultMap
) => {
  const mapStateToProps = mapStateToPropsFactory(updater);
  return connect(mapStateToProps);
};

export default regionsContainer;
