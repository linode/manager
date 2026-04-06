import { linodeFactory, regionFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, typeFactory } from 'src/factories';
import {
  renderWithThemeAndHookFormContext,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { LinodeSelectTableRow } from './LinodeSelectTableRow';

const queryMocks = vi.hoisted(() => ({
  useImageQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useTypeQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useImageQuery: queryMocks.useImageQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useTypeQuery: queryMocks.useTypeQuery,
  };
});

describe('LinodeSelectTableRow', () => {
  it('should render a Radio that is labeled by the Linode label', () => {
    const linode = linodeFactory.build();

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    expect(getByLabelText(linode.label)).toHaveRole('radio');
  });

  it('should render a checked Radio if selected is true', () => {
    const linode = linodeFactory.build();

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    expect(getByLabelText(linode.label)).toBeChecked();
  });

  it('should render a unchecked Radio if selected is false', () => {
    const linode = linodeFactory.build();

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected={false}
        />
      ),
    });

    expect(getByLabelText(linode.label)).not.toBeChecked();
  });

  it('should should call onSelect when a radio is selected', async () => {
    const linode = linodeFactory.build();

    const onSelect = vi.fn();

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={true}
          isShutdownable={false}
          linode={linode}
          onSelect={onSelect}
          selected={false}
        />
      ),
    });

    const radio = getByLabelText(linode.label);
    await userEvent.click(radio);

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('should render a Linode image label', async () => {
    const linode = linodeFactory.build({ image: 'my-image' });
    const image = imageFactory.build({
      id: 'my-image',
      label: 'My Image Nice Label',
    });

    queryMocks.useImageQuery.mockReturnValue({
      data: image,
    });

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    await findByText(image.label);
  });

  it('should render a Linode region label', async () => {
    const linode = linodeFactory.build({ region: 'us-test' });
    const region = regionFactory.build({
      id: 'us-test',
      label: 'US Test',
    });

    queryMocks.useRegionsQuery.mockReturnValue({
      data: [region],
    });

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    await findByText(region.label);
  });

  it('should render a Linode plan label', async () => {
    const linode = linodeFactory.build({ type: 'linode-type-1' });
    const type = typeFactory.build({
      id: 'linode-type-1',
      label: 'Linode Type 1',
    });

    queryMocks.useTypeQuery.mockReturnValue({
      data: type,
    });

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    await findByText(type.label);
  });

  it('should render a disabled power off button if the Linode is powered on, a onPowerOff function is passed, and the row is selected, but user does not have shutdown_linode permission', async () => {
    const linode = linodeFactory.build({ status: 'running' });

    const { getByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={false}
          isShutdownable={false}
          linode={linode}
          onPowerOff={vi.fn()}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    expect(getByText('Power Off')).toBeDisabled();
  });

  it('should render an enabled power off button if the Linode is powered on, a onPowerOff function is passed, and the row is selected, if user has shutdown_linode permission', async () => {
    const linode = linodeFactory.build({ status: 'running' });

    const { getByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={true}
          isShutdownable={true}
          linode={linode}
          onPowerOff={vi.fn()}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    expect(getByText('Power Off')).toBeEnabled();
  });

  it('should call onPowerOff when "Power Off" is clicked', async () => {
    const linode = linodeFactory.build({ status: 'running' });
    const onPowerOff = vi.fn();

    const { getByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(
        <LinodeSelectTableRow
          disabled={false}
          isCloneable={true}
          isShutdownable={true}
          linode={linode}
          onPowerOff={onPowerOff}
          onSelect={vi.fn()}
          selected
        />
      ),
    });

    await userEvent.click(getByText('Power Off'));

    expect(onPowerOff).toHaveBeenCalled();
  });
});
