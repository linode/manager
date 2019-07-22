import { shallow } from 'enzyme';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { BackupsDashboardCard } from './BackupsDashboardCard';

const classes = {
  root: '',
  header: '',
  icon: '',
  itemTitle: '',
  section: '',
  sectionLink: '',
  title: '',
  ctaLink: ''
};

const props = {
  linodesWithoutBackups: 0,
  openBackupDrawer: jest.fn(),
  classes
};

const component = shallow(
  <BackupsDashboardCard {...props} {...reactRouterProps} />
);

describe('Backups dashboard card', () => {
  it('should render a link to /account/settings', () => {
    expect(component.find('[data-qa-account-link]')).toHaveLength(1);
  });
  it('should not render Enable Backups for Existing Linodes if there are no Linodes w/out backups', () => {
    expect(component.find('[data-qa-backup-existing]')).toHaveLength(0);
  });
  it('should render the backup-existing section if there are Linodes to be backed up', () => {
    component.setProps({ linodesWithoutBackups: 2 });
    expect(component.find('[data-qa-backup-existing]')).toHaveLength(1);
  });
  it('should open the backup drawer when backup-existing is clicked', () => {
    component.find('[data-qa-backup-existing]').simulate('click');
    expect(props.openBackupDrawer).toHaveBeenCalled();
  });
  it('should display the number of Linodes to be backed up', () => {
    component.setProps({ linodesWithoutBackups: 3 });
    expect(component.find('[data-qa-linodes-message]').text()).toMatch(
      '3 Linodes'
    );
  });
  it('should pluralize the displayed number of Linodes correctly', () => {
    component.setProps({ linodesWithoutBackups: 1 });
    expect(component.find('[data-qa-linodes-message]').text()).toMatch(
      '1 Linode'
    );
  });
});
