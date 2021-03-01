import { entityFactory, eventFactory } from 'src/factories/events';
import recentEventForLinode from './recentEventForLinode';

describe('recentEventForLinode selector', () => {
  const selector = recentEventForLinode(1);
  const entity = entityFactory.build({
    id: 1,
  });

  it('only returns in-progress events', () => {
    const nonInProgressEvent = eventFactory.build({
      entity,
      percent_complete: null,
    });
    const inProgressEvent = eventFactory.build({
      entity,
      percent_complete: 50,
    });
    const mockState1: any = { events: { events: [nonInProgressEvent] } };
    const mockState2: any = { events: { events: [inProgressEvent] } };
    expect(selector(mockState1)).toBeUndefined();
    expect(selector(mockState2)).toBeDefined();
  });

  it('only returns events relevant to the Linode', () => {
    const irrelevantEvent = eventFactory.build({
      entity: entityFactory.build({
        id: 2,
      }),
    });
    const relevantEvent = eventFactory.build({
      entity,
    });
    const mockState1: any = { events: { events: [irrelevantEvent] } };
    const mockState2: any = { events: { events: [relevantEvent] } };
    expect(selector(mockState1)).toBeUndefined();
    expect(selector(mockState2)).toBeDefined();
  });
});
