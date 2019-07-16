import { shallow } from 'enzyme';
import * as React from 'react';
// import { render } from 'react-testing-library';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { CombinedProps, LinodeActionMenu } from './LinodeActionMenu';

// import { wrapWithTheme } from 'src/utilities/testHelpers';

const props: CombinedProps = {
  linodeId: 123,
  linodeLabel: 'testLinode',
  linodeRegion: 'us-east',
  linodeType: 'g6-standard-1',
  linodeBackups: {
    schedule: {
      window: null,
      day: null
    },
    enabled: false
  },
  linodeStatus: '',
  noImage: false,
  openConfigDrawer: jest.fn(),
  toggleConfirmation: jest.fn(),
  ...reactRouterProps
};

// const includesActions = (actions: string[], query: any) => {
//   for (const action of actions) {
//     expect(query(action)).toBeInTheDocument();
//   }
// };

describe('LinodeActionMenu', () => {
  const wrapper = shallow<LinodeActionMenu>(<LinodeActionMenu {...props} />);

  //   it('should include standard Linode actions', () => {
  //     const { queryByText } = render(
  //       wrapWithTheme(<LinodeActionMenu {...props} />)
  //     );
  //     includesActions(
  //       ['Launch Console', 'Clone', 'Resize', 'Settings', 'Delete'],
  //       queryByText
  //     );
  //   });

  // it('should render a Power On action if Linode is powered off', () => {
  //   const { queryByText } = render(
  //     wrapWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />)
  //   );
  //   expect(queryByText('Power On')).toBeInTheDocument();
  //   expect(queryByText('Power Off')).not.toBeInTheDocument();
  //   expect(queryByText('Reboot')).not.toBeInTheDocument();
  // });

  // it('should render Power Off and Reboot actions if Linode is powered on', () => {
  //   const { queryByText } = render(
  //     wrapWithTheme(<LinodeActionMenu {...props} linodeStatus="running" />)
  //   );
  //   expect(queryByText('Reboot')).toBeInTheDocument();
  //   expect(queryByText('Power Off')).toBeInTheDocument();
  //   expect(queryByText('Power On')).not.toBeInTheDocument();
  // });

  // it('should render an Enable Backups action if Backups are not enabled', () => {
  //   const { queryByText } = render(
  //     wrapWithTheme(<LinodeActionMenu {...props} linodeBackups.enabled={false} />)
  //   );
  //   expect(queryByText('Enable Backups')).toBeInTheDocument();
  //   expect(queryByText('View Backups')).not.toBeInTheDocument();
  // });

  // it('should render a View Backups action (and not show Enable Backups) if Backups are already enabled', () => {
  //   const { queryByText } = render(
  //     wrapWithTheme(<LinodeActionMenu {...props} linodeBackups.enabled={true} />)
  //   );
  //   expect(queryByText('View Backups')).toBeInTheDocument();
  //   expect(queryByText('Enable Backups')).not.toBeInTheDocument();
  // });

  describe('buildQueryStringForLinodeClone', () => {
    it('returns `type`, `subtype`, and `linodeID` params', () => {
      const result = wrapper.instance().buildQueryStringForLinodeClone();
      expect(result).toMatch('type=');
      expect(result).toMatch('subtype=');
      expect(result).toMatch('linodeID=');
    });

    it('includes `regionID` param if valid region', () => {
      wrapper.setProps({
        linodeRegion: 'us-east',
        regionsData: [{ id: 'us-east', country: 'us' }]
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).toMatch(
        'regionID=us-east'
      );

      wrapper.setProps({
        linodeRegion: 'invalid-region'
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).not.toMatch(
        'regionID='
      );
    });

    it('includes `typeID` param if valid type', () => {
      wrapper.setProps({
        // This is not actually (currently) a valid type, but it's in the mock data
        linodeType: 'g5-standard-2',
        typesData: extendedTypes
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).toMatch(
        'typeID=g5-standard-2'
      );

      wrapper.setProps({
        linodeType: 'invalid-type'
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).not.toMatch(
        'typeID='
      );
    });
  });
});
