import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptCreate } from './StackScriptCreate';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { imageFactory, normalizeEntities, profileFactory } from 'src/factories';
import { UseQueryResult } from 'react-query';
import { Grants, Profile } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';

const images = normalizeEntities(imageFactory.buildList(10));

describe('StackScriptCreate', () => {
  const component = shallow(
    <StackScriptCreate
      {...reactRouterProps}
      mode="create"
      classes={{
        backButton: '',
        createTitle: '',
      }}
      imagesData={images}
      imagesLoading={false}
      profile={
        { data: profileFactory.build() } as UseQueryResult<Profile, APIError[]>
      }
      grants={{ data: {} } as UseQueryResult<Grants, APIError[]>}
      setDocs={jest.fn()}
      clearDocs={jest.fn()}
    />
  );
  xit('should render a title that reads "Create StackScript', () => {
    const titleText = component
      .find('WithStyles(Typography)')
      .first()
      .children()
      .text();
    expect(titleText).toBe('Create StackScript');
  });

  xit(`should render a confirmation dialog with the
  title "Clear StackScript Configuration?"`, () => {
    const modalTitle = component
      .find('WithStyles(ConfirmationDialog)')
      .prop('title');
    expect(modalTitle).toBe('Clear StackScript Configuration?');
  });

  xit('should render StackScript Form', () => {
    expect(component.find('StackScriptForm')).toHaveLength(1);
  });

  describe('Back Arrow Icon Button', () => {
    xit('should render back array icon button', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      expect(backIcon.find('pure(KeyboardArrowLeft)')).toHaveLength(1);
    });

    xit('back arrow icon should link back to stackscripts landing', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      const parentLink = backIcon.closest('Link');
      expect(parentLink.prop('to')).toBe('/stackscripts');
    });
  });

  describe('Breadcrumb', () => {
    const breadcrumb = component.find(
      '[data-qa-create-stackscript-breadcrumb]'
    );
    it('should render', () => {
      expect(breadcrumb).toHaveLength(1);
    });
  });
});
