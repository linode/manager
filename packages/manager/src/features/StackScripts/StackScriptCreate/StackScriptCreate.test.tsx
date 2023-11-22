import { Grants, Profile } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { shallow } from 'enzyme';
import * as React from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { imageFactory, normalizeEntities, profileFactory } from 'src/factories';
import { queryClientFactory } from 'src/queries/base';

import { StackScriptCreate } from './StackScriptCreate';

const images = normalizeEntities(imageFactory.buildList(10));
const queryClient = queryClientFactory();

describe('StackScriptCreate', () => {
  const component = shallow(
    <StackScriptCreate
      {...reactRouterProps}
      profile={
        { data: profileFactory.build() } as UseQueryResult<Profile, APIError[]>
      }
      grants={{ data: {} } as UseQueryResult<Grants, APIError[]>}
      imagesData={images}
      imagesLastUpdated={0}
      imagesLoading={false}
      mode="create"
      queryClient={queryClient}
    />
  );

  it.skip('should container <LandingHeader />', () => {
    expect(component.find('LandingHeader')).toHaveLength(1);
  });

  it.skip('should render a title that reads "Create StackScript', () => {
    const titleText = component
      .find('WithStyles(Typography)')
      .first()
      .children()
      .text();
    expect(titleText).toBe('Create StackScript');
  });

  it.skip(`should render a confirmation dialog with the
  title "Clear StackScript Configuration?"`, () => {
    const modalTitle = component
      .find('WithStyles(ConfirmationDialog)')
      .prop('title');
    expect(modalTitle).toBe('Clear StackScript Configuration?');
  });

  it.skip('should render StackScript Form', () => {
    expect(component.find('StackScriptForm')).toHaveLength(1);
  });

  describe('Back Arrow Icon Button', () => {
    it.skip('should render back array icon button', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      expect(backIcon.find('pure(KeyboardArrowLeft)')).toHaveLength(1);
    });

    it.skip('back arrow icon should link back to stackscripts landing', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      const parentLink = backIcon.closest('Link');
      expect(parentLink.prop('to')).toBe('/stackscripts');
    });
  });
});
