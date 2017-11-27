import Polling from '~/api/polling';

describe('Polling', function () {
  let polling;

  beforeEach(function () {
    polling = Polling({
      apiRequestFn: jest.fn(),
    });
  });

  afterEach(function () {
  });

  it('defines a simple function constructor', function () {
    expect(Polling).toBeDefined();
    expect(polling).toBeDefined();
    expect(typeof polling).toBe('object');
  });

  it('defines an interface', function () {
    expect(polling.start).toBeDefined();
    expect(polling.stop).toBeDefined();
  });

  it('will execute a provided function', function () {
    // this.timeout(50);
    const options = {
      apiRequestFn: async function (done) {
        polling.stop();
        done();
      },
      timeout: 10,
    };

    polling = Polling(options);
    polling.start();
  });
});
