import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import KubernetesSvg from 'src/assets/addnewmenu/kubernetes.svg';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';

type Props = RouteComponentProps<{}>;

class KubernetesEmptyState extends React.Component<Props> {
  render() {
    const SubtitleCopy = () => (
      <>
        <Typography variant="subtitle1">Need help getting started?</Typography>
        <Typography variant="subtitle1">
          <a
            href="https://www.linode.com/docs/applications/containers/kubernetes/how-to-deploy-a-cluster-with-lke/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-u"
          >
            Learn more about getting started with LKE.
          </a>
        </Typography>
      </>
    );

    return (
      <Placeholder
        title="Add your first Kubernetes cluster!"
        copy={<SubtitleCopy />}
        icon={KubernetesSvg}
        buttonProps={[
          {
            onClick: () => this.props.history.push('/kubernetes/create'),
            children: 'Create a Cluster'
          }
        ]}
      />
    );
  }
}
const enhanced = compose(withRouter);

export default enhanced(KubernetesEmptyState);
