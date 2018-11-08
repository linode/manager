import { shallow } from 'enzyme';
import * as React from 'react';

import { linode1, linode3 } from 'src/__data__/linodes';
import * as types from 'src/__data__/types';

import {
  addErrors,
  addTypeInfo,
  BackupDrawer,
  enhanceLinodes,
} from './BackupDrawer';

const linodes = [linode1, linode3];
const error = {
  linodeId: linode1.id,
  reason: "Error"
}

// Props for shallow rendering

const actions = {
  enable: jest.fn(),
  getLinodesWithoutBackups: jest.fn(),
  close: jest.fn(),
  dismissError: jest.fn(),
  dismissSuccess: jest.fn(),
  clearSidebar: jest.fn(),
}

const classes = { root: ''}

const props = {
  actions,
  classes,
  open: true,
  loading: false,
  enabling: false,
  backupLoadError: '',
  linodesWithoutBackups: [],
  backupsLoading: false,
  enableSuccess: false,
  enableErrors: [],
  typesLoading: false,
  typesData: types.types,
}

const component = shallow(
  <BackupDrawer {...props} />
)

describe("BackupDrawer component", () => {
  afterEach(() => {
    jest.resetAllMocks();
  })
  describe("adding type and error info to Linodes", () => {
    it("should add type info to a list of Linodes", () => {
      const withTypes = addTypeInfo(types.types, linodes);
      expect(withTypes[0].typeInfo).toHaveProperty('label', 'Linode 1024');
      expect(withTypes[1].typeInfo).toHaveProperty('label', 'Linode 4096');
    });
    it("should attach an error to a Linode", () => {
      const withErrors = addErrors([error], linodes);
      expect(withErrors[0].linodeError).toHaveProperty('reason', 'Error');
      expect(withErrors[1].linodeError).toBeUndefined();
    });
    it("enhanceLinodes should attach typeInfo and linodeError", () => {
      const enhanced = enhanceLinodes(linodes, [error], types.types);
      expect(enhanced[0]).toHaveProperty('typeInfo');
      expect(enhanced[0]).toHaveProperty('linodeError');
    });
    it("should set typeInfo and linodeError to undefined if nothing matches", () => {
      expect(enhanceLinodes(linodes, [], [])).toEqual([
        {...linode1, typeInfo: undefined, linodeError: undefined},
        {...linode3, typeInfo: undefined, linodeError: undefined}
      ]);
    });
  });
  describe("Backup Drawer", () => {
    it("should close the drawer on successful submission", () => {
      component.setProps({ enableSuccess: true });
      expect(actions.close).toHaveBeenCalled();
    });
    it("should request un-backed-up Linodes on load, if the list is empty", () => {
      component.instance().componentDidMount!();
      expect(actions.getLinodesWithoutBackups).toHaveBeenCalledTimes(1);
    });
    it("should not request Linodes in cDM if there are already Linodes in props", () => {
      component.setProps({ linodesWithoutBackups: [linode3]});
      component.instance().componentDidMount!();
      expect(actions.getLinodesWithoutBackups).not.toHaveBeenCalled();
    });
    it("should display an error Notice", () => {
      expect(component.find('WithStyles(Notice)')).toHaveLength(0);
      component.setProps({ enableErrors: [error]});
      expect(component.find('WithStyles(Notice)')).toHaveLength(1);
    });
    it("should call enableBackups on submit", () => {
      const button = component.find('[data-qa-submit]');
      button.simulate('click');
      expect(actions.enable).toHaveBeenCalled();
    });
    it("should close the drawer on Cancel", () => {
      const cancel = component.find('[data-qa-cancel]');
      cancel.simulate('click');
      expect(actions.close).toHaveBeenCalled();
    });
  });
});