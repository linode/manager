import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesDrawer, Props } from './ImagesDrawer';

const props: Props = {
  changeDescription: vi.fn(),
  changeDisk: vi.fn(),
  changeLabel: vi.fn(),
  changeLinode: vi.fn(),
  changeTags: vi.fn(),
  mode: 'edit',
  onClose: vi.fn(),
  open: true,
  selectedLinode: null,
};

describe('ImagesDrawer edit mode', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(
      <ImagesDrawer {...props} mode="edit" />
    );

    // Verify title renders
    getByText('Edit Image');
  });

  it('should allow editing image details', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ImagesDrawer {...props} mode="edit" />
    );

    fireEvent.change(getByLabelText('Label'), {
      target: { value: 'test-image-label' },
    });

    fireEvent.change(getByLabelText('Description'), {
      target: { value: 'test description' },
    });

    fireEvent.change(getByLabelText('Tags'), {
      target: { value: 'new-tag' },
    });
    fireEvent.click(getByText('Create "new-tag"'));

    fireEvent.click(getByText('Save Changes'));

    expect(props.changeLabel).toBeCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test-image-label' }),
      })
    );

    expect(props.changeDescription).toBeCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test description' }),
      })
    );

    expect(props.changeTags).toBeCalledWith(['new-tag']);
  });
});

describe('ImagesDrawer restore mode', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(
      <ImagesDrawer {...props} mode="restore" />
    );

    // Verify title renders
    getByText('Restore from Image');
  });

  it('should allow editing image details', async () => {
    const { findByText, getByRole, getByText } = renderWithTheme(
      <ImagesDrawer {...props} mode="restore" />
    );

    server.use(
      http.get('*/linode/instances', () => {
        return HttpResponse.json(makeResourcePage(linodeFactory.buildList(5)));
      })
    );

    await userEvent.click(getByRole('combobox'));
    await userEvent.click(await findByText('linode-1'));
    await userEvent.click(getByText('Restore Image'));

    expect(props.changeLinode).toBeCalledWith(1);
  });
});
