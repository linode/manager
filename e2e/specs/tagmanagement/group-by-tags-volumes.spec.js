const { constants } = require('../../constants');
import {
    timestamp,
    createVolumes,
    apiDeleteAllVolumes,
} from '../../utils/common';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe('Group by Tag - Volumes', () => {
  const tags = [`b${timestamp()}`,`a${timestamp()}`,`c${timestamp()}`];
  let volumes = [];

  const generateTagGroups = () => {
      tags.forEach((tag) => {
          const vol = {
              label: `${tag}${timestamp()}.org`,
              tags: [tag]
          }
          const vol1 = {
              label: `${tag}${timestamp()}.org`,
              tags: [tag]
          }
          volumes.push(lin);
          volumes.push(lin1);
      });
  }

  beforeAll(() => {
      generateTagGroups();
      createVolumes(Volumes);
  });


});
