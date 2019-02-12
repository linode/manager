import { lifecycle } from 'recompose';
import { getLinodeConfigs } from 'src/services/linodes';

interface OutterProps {
  linodeId: number;
}

interface LinodeConfigsState {
  configsLoading: boolean;
  configsError: Linode.ApiFieldError[];
  configsData: Linode.Config[];
}

export default lifecycle<OutterProps, LinodeConfigsState>({
  componentDidMount() {
    const { linodeId } = this.props;

    this.setState({ configsData: [], configsLoading: true });

    getLinodeConfigs(linodeId)
      .then(({ data }) =>
        this.setState({ configsLoading: false, configsData: data })
      )
      .catch(err =>
        this.setState({ configsLoading: false, configsError: err })
      );
  },

  componentDidUpdate(prevProps) {
    const { linodeId } = prevProps;
    const { linodeId: prevLinodeId } = this.props;
    if (linodeId === prevLinodeId) {
      return;
    }
    this.setState({ configsData: [], configsLoading: true });

    getLinodeConfigs(linodeId)
      .then(({ data }) =>
        this.setState({ configsLoading: false, configsData: data })
      )
      .catch(err =>
        this.setState({ configsLoading: false, configsError: err })
      );
  }
});
