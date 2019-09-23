import * as React from 'react';
import { compose } from 'recompose';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';
import { MonitoringYourServer } from 'src/documentation';

import { getValues } from './longviewRequests';

const DUMMY_KEY = 'AFD0FFEF-9706-D7DF-C1AAAC956F40E301';

export class LongviewLanding extends React.Component<{}, {}> {
  static docs: Linode.Doc[] = [
    {
      title: 'What is Longview and How to Use it',
      src: 'https://www.linode.com/docs/platform/longview/longview/',
      body: `This guide shows how to install and use Linode Longview.`
    },
    MonitoringYourServer
  ];

  /**
   * Only for testing the LV API. Will be deleted pre-merge.
   */
  componentDidMount() {
    const _getValues = getValues(DUMMY_KEY);
    _getValues(['uptime'])
      .then(response => console.log(response))
      .catch(e => console.log('error!', e));
  }

  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Longview" />
        <Placeholder
          title="Longview"
          copy="Keep your Linux systems running smoothly with insights from your system metrics."
          buttonProps={[
            {
              onClick: () =>
                window.open(
                  'https://manager.linode.com/longview',
                  '_blank',
                  'noopener'
                ),
              children: 'Navigate to Classic Manager'
            }
          ]}
        />
      </React.Fragment>
    );
  }
}

export default compose<{}, {}>(setDocs(LongviewLanding.docs))(LongviewLanding);
