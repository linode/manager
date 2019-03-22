import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface DefaultProps {
  clustersData: Linode.Cluster[];
  clustersError?: Linode.ApiFieldError[];
  clustersLoading: boolean;
}

const defaultMap: (p: InjectedProps) => DefaultProps = ({
  data,
  error,
  loading
}) => ({
  clustersData: data,
  clustersError: error,
  clustersLoading: loading
});

interface InjectedProps {
  data: Linode.Cluster[];
  error?: Linode.ApiFieldError[];
  loading: boolean;
}

const mapStateToPropsFactory = <MappedProps>(
  updater: (v: InjectedProps) => MappedProps
) => (state: ApplicationState): MappedProps => {
  const { entities: data, loading, error } = state.__resources.clusters;

  return updater({ data, loading, error });
};

const clustersContainer = <MappedProps>(
  updater: (v: InjectedProps) => DefaultProps | MappedProps = defaultMap
) => {
  const mapStateToProps = mapStateToPropsFactory(updater);
  return connect(mapStateToProps);
};

export default clustersContainer;
