import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { profileFactory } from 'src/factories';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptCreate } from './StackScriptCreate';

import type { Grants, Profile } from '@linode/api-v4/lib';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseQueryResult } from '@tanstack/react-query';

const queryClient = queryClientFactory();

describe('StackScriptCreate', () => {
  it('should render header, inputs, and buttons', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <StackScriptCreate
        {...reactRouterProps}
        profile={
          { data: profileFactory.build() } as UseQueryResult<
            Profile,
            APIError[]
          >
        }
        grants={{ data: {} } as UseQueryResult<Grants, APIError[]>}
        mode="create"
        queryClient={queryClient}
      />,
      { queryClient }
    );

    expect(getByText('Create')).toBeVisible();

    expect(getByLabelText('StackScript Label (required)')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();
    expect(getByLabelText('Target Images (required)')).toBeVisible();
    expect(getByLabelText('Script (required)')).toBeVisible();
    expect(getByLabelText('Revision Note')).toBeVisible();

    const createButton = getByText('Create StackScript').closest('button');
    expect(createButton).toBeVisible();
    expect(createButton).toBeDisabled();

    const resetButton = getByText('Reset').closest('button');
    expect(resetButton).toBeVisible();
    expect(resetButton).toBeEnabled();
  });
});
