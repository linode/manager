import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { selectDefaultConfig } from './PowerActionsDialogOrDrawer';

describe('Default config selection logic', () => {
  it('should return undefined when more than one config is available', () => {
    expect(selectDefaultConfig()).toBeUndefined();
  });

  it('should return undefined when no configs are available', () => {
    const configs = linodeConfigFactory.buildList(4);
    expect(selectDefaultConfig(configs)).toBeUndefined();
  });

  it('should return the first (only) config ID when exactly one config is available', () => {
    const configs = linodeConfigFactory.buildList(1);
    expect(selectDefaultConfig(configs)).toEqual(configs[0].id);
  });
});
