import { lifecycle } from 'recompose';
import { getLinodeDisks } from 'src/services/linodes';

interface OutterProps {
  linodeId: number;
}

interface LinodeDisksState {
  disksLoading: boolean;
  disksError: Linode.ApiFieldError[];
  disksData: Linode.Disk[];
}

export default lifecycle<OutterProps, LinodeDisksState>({
  componentDidMount() {
    const { linodeId } = this.props;

    this.setState({ disksData: [], disksLoading: true });

    getLinodeDisks(linodeId)
      .then(({ data }) =>
        this.setState({ disksLoading: false, disksData: data })
      )
      .catch(err => this.setState({ disksLoading: false, disksError: err }));
  },

  componentDidUpdate(prevProps) {
    const { linodeId } = prevProps;
    const { linodeId: prevLinodeId } = this.props;
    if (linodeId === prevLinodeId) {
      return;
    }

    this.setState({ disksData: [], disksLoading: true });

    getLinodeDisks(linodeId)
      .then(({ data }) =>
        this.setState({ disksLoading: false, disksData: data })
      )
      .catch(err => this.setState({ disksLoading: false, disksError: err }));
  }
});
