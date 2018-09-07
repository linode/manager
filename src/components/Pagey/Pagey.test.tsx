import { shallow } from 'enzyme';
import * as React from 'react';
import paginate from './Pagey';

const mockData: Linode.ResourcePage<any> = {
  page: 1, pages: 1, results: 0, data: []
};

const mockFn = jest.fn(() => Promise.resolve(mockData));

const setup = (mockRequest: any = mockFn) => {
  const MyComponent = paginate(mockRequest)(() => <div />);

  return {
    mockRequest,
    wrapper: shallow(<MyComponent />)
  };
};

describe('Paginator 2: Pagement Day', () => {

  describe('props', () => {
    const { wrapper } = setup();

    const {
      count, handlePageChange, handlePageSizeChange, loading, page, pageSize, request,
    } = wrapper.props();

    it('should provide a count prop', () => {
      expect(count).toBeDefined();
    });

    it('should default count to 0', () => {
      expect(count).toBe(0);
    });

    it('should provide a page prop', () => {
      expect(page).toBeDefined();
    });

    it('should deafult page prop to 1', () => {
      expect(page).toEqual(1);
    });

    it('should provide pageSize prop', () => {
      expect(pageSize).toBeDefined();
    });

    it('should deafult pageSize to 25', () => {
      expect(pageSize).toEqual(25);
    });

    it('should provide a handlePageChange handler prop', () => {
      expect(handlePageChange).toBeDefined();
      expect(handlePageChange).toBeInstanceOf(Function);
    });

    it('should provide a handlePageSizeChange handler prop', () => {
      expect(handlePageSizeChange).toBeDefined();
      expect(handlePageSizeChange).toBeInstanceOf(Function);
    });

    it('should provide a loading prop', () => {
      expect(loading).toBeDefined()
    });

    it('should default loading to true', () => {
      expect(loading).toBeTruthy();
    });

    it('should provide a request handler prop', () => {
      expect(request).toBeDefined();
      expect(request).toBeInstanceOf(Function);
    });
  });

  describe('when handlePageChange is called', () => {

    it('should update page with provided argument', () => {
      const mockData: Linode.ResourcePage<any> = {
        page: 1, pages: 1, results: 0, data: []
      };

      const { wrapper } = setup(jest.fn((() => Promise.resolve(mockData))))

      const handlePageChange = wrapper.prop('handlePageChange');

      handlePageChange(9);

      wrapper.update();

      expect(wrapper.prop('page')).toEqual(9);
    });

    it('should result in the request being called with updated params', () => {
      const mockData: Linode.ResourcePage<any> = {
        page: 1, pages: 1, results: 0, data: []
      };

      const { wrapper, mockRequest } = setup(jest.fn((() => Promise.resolve(mockData))))

      const handlePageChange = wrapper.prop('handlePageChange');

      handlePageChange(9);

      wrapper.update();

      expect(mockRequest).toBeCalledWith({ page: 9, page_size: 25 }, {});
    });
  });

  describe('when handlePageSizeChange is called', () => {

    it('should update pageSize with provided argument', () => {
      const mockData: Linode.ResourcePage<any> = {
        page: 1, pages: 1, results: 0, data: []
      };

      const { wrapper } = setup(jest.fn((() => Promise.resolve(mockData))));

      const handlePageSizeChange = wrapper.prop('handlePageSizeChange');

      handlePageSizeChange(100);

      wrapper.update();

      expect(wrapper.prop('pageSize')).toEqual(100);
      expect(wrapper.prop('page')).toEqual(1);
    });

    it('should result in the request being called with updated params', () => {
      const mockData: Linode.ResourcePage<any> = {
        page: 1, pages: 1, results: 0, data: []
      };

      const { wrapper, mockRequest } = setup(jest.fn((() => Promise.resolve(mockData))));

      const handlePageSizeChange = wrapper.prop('handlePageSizeChange');

      handlePageSizeChange(100);

      wrapper.update();

      expect(mockRequest).toBeCalledWith({ page: 1, page_size: 100 }, {});
    });
  })

  describe('when requesting data', () => {
    describe('and the promise resolves', () => {
      const mockData = {
        page: 2,
        pages: 2,
        data: [1, 2, 3, 4],
        results: 4
      };

      const { wrapper } = setup(() => Promise.resolve(mockData));

      beforeAll(async () => {
        await wrapper.prop('request')();
        wrapper.update()
      });

      it('should set data to response.data', () => {
        expect(wrapper.prop('result')).toEqual([1, 2, 3, 4]);
      });

      it('should set page to response.page', () => {
        expect(wrapper.prop('page')).toBe(2);
      });

      it('should set count to response.result', () => {
        expect(wrapper.prop('count')).toBe(4);
      });

      it('should apply the map function to the response.result', async () => {
        const fn = (numbers: number[]) => numbers.map((n) => n + 1);
        await wrapper.prop('request')(fn);
        wrapper.update();
        expect(wrapper.prop('result')).toEqual([2, 3, 4, 5]);
      });
    });

    describe('and the promise rejects', async () => {
      const { wrapper } = setup(() => Promise.reject(new Error()));

      beforeAll(async () => {
        await wrapper.prop('request')();
        wrapper.update()
      });

      it('should set error to rejected value', () => {
        expect(wrapper.prop('error')).toBeInstanceOf(Error);
      });
    });
  });

  describe('sorting', () => {
    const { wrapper, mockRequest } = setup();
    const updateOrderBy = wrapper.prop('updateOrderBy');

    beforeEach(() => {
      mockRequest.mockClear();
    })

    it('should provide a updateOrderBy handler prop', () => {
      expect(updateOrderBy).toBeDefined();
      expect(updateOrderBy).toBeInstanceOf(Function);
    });

    it('should send request with sort by prop asecending on first call', () => {
      updateOrderBy('label');

      expect(mockRequest).toHaveBeenCalledWith({ page: 1, page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
    });

    it('should send request with sort by prop descending on second call', () => {
      updateOrderBy('label');

      expect(mockRequest).toHaveBeenCalledWith({ page: 1, page_size: 25 }, { '+order_by': 'label', '+order': 'desc' })
    });

    it('should send request with sort by prop ascending on third call', () => {
      updateOrderBy('label');

      expect(mockRequest).toHaveBeenCalledWith({ page: 1, page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
    });

    it('should send request with sort by prop ascending on first call of new label', () => {
      updateOrderBy('other');

      expect(mockRequest).toHaveBeenCalledWith({ page: 1, page_size: 25 }, { '+order_by': 'other', '+order': 'asc' })
    });
  });
});
