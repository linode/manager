import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { UserDefinedFields } from './UserDefinedFields';
import { getDefaultUDFData } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('UserDefinedFields', () => {
  it('should render UDFs for the selected StackScript', async () => {
    const stackscript = stackScriptFactory.build({
      user_defined_fields: [
        {
          label: 'Server Username',
          name: 'username',
        },
        {
          label: 'Server Password',
          name: 'password',
        },
        {
          label: 'Protocol',
          name: 'protocol',
          oneof: 'tcp',
        },
        {
          label: 'User Type',
          manyof: 'admin,mod,normal',
          name: 'user_type',
        },
        {
          default: 'password123',
          label: 'Admin Password',
          name: 'admin_password',
        },
      ],
    });

    server.use(
      http.get('*/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByLabelText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <UserDefinedFields />,
        useFormOptions: {
          defaultValues: { stackscript_id: stackscript.id },
        },
      });

    for (const udf of stackscript.user_defined_fields) {
      // eslint-disable-next-line no-await-in-loop
      await findByLabelText(udf.label, { exact: false });
    }
  });

  it('should render a notice if this is a cluster', async () => {
    const stackscript = stackScriptFactory.build({
      id: 607488,
      label: 'Marketplace App for Redis',
      user_defined_fields: [
        {
          default: '3',
          label: 'Cluster Size',
          name: 'cluster_size',
          oneof: '3,5',
        },
      ],
    });

    server.use(
      http.get('*/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByText, getByLabelText, getByText } =
      renderWithThemeAndHookFormContext({
        component: <UserDefinedFields />,
        useFormOptions: {
          defaultValues: {
            stackscript_data: getDefaultUDFData(
              stackscript.user_defined_fields
            ),
            stackscript_id: stackscript.id,
          },
        },
      });

    // Very the title renders
    await findByText(`${stackscript.label} Setup`);

    // Verify the defuault cluster size is selected
    expect(getByLabelText('3')).toBeChecked();

    // Verify the cluster notice shows
    expect(getByText('You are creating a cluster with 3 nodes.')).toBeVisible();

    // Verify the details button renders
    expect(
      getByLabelText(`View details for ${stackscript.label}`)
    ).toBeVisible();
  });
});
