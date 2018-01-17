import LinodeAPI from './index';

describe('src/LinodeAPI/index', () => {
  describe('LinodeAPI', () => {
    describe('Instantiation', () => {
      it('should be a Function', () => {
        expect(LinodeAPI).toBeInstanceOf(Function);
      });

      it('should return an instance of LinodeAPI', () => {
        const instance = new LinodeAPI('http://www.mysite.com', 'ABC123');
        expect(instance).toBeInstanceOf(LinodeAPI);
      });

      it('should throw an error if baseURL is undefined', () => {
        expect(() => {
          return new LinodeAPI(undefined, 'ABC1234');
        }).toThrow(Error(LinodeAPI.NULL_BASE_URL_ERROR));
      });
    });

    describe('key', () => {
      it('should update the apiKey', () => {
        const instance = new LinodeAPI('www.google.com', 'ABC123');
        instance.key = '321CBA';
        expect(instance.opts.headers.Authorization).toBe(LinodeAPI.tokenString('321CBA'));
        expect(instance.opts.baseURL).toBe('www.google.com');
      });
    });

    ['get', 'post', 'put', 'delete']
      .forEach((method) => {
        describe(`${method}`, () => {
          const instance = new LinodeAPI('http://www.mysite.com', 'MY-API-TOKEN');
          const fn = instance[method];

          it('should exists', () => {
            expect(fn).toBeDefined();
          });

          it('should be a Function', () => {
            expect(fn).toBeInstanceOf(Function);
          });

          it('should return a Promise', () => {
            return expect(
              fn('/something', {})
                .catch(() => { })
            ).toBeInstanceOf(Promise);
          });
        });
      });
  });
});
