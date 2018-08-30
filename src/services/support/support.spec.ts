import { AxiosRequestConfig } from 'axios';
import * as support from './support';

import { API_ROOT } from 'src/constants';

const mockFn = jest.fn((config:AxiosRequestConfig) => Promise.resolve({data:config}));

interface Pagination {
  page: number,
  pageSize: number,
}

const pagination: Pagination = { page: 1, pageSize: 25}

const filter = {'+order_by': 'updated', '+order': 'desc'};

jest.mock('axios', () => ({
  default: (config:AxiosRequestConfig) => mockFn(config),
}));

describe("Support tickets and replies", () => {
  describe("getTickets method", () => {
    it("should make a get request", async () => {
      await support.getTickets();
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets`,
      });
      mockFn.mockClear();
    });

    it("should accept pagination", async () => {
      await support.getTickets(pagination);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets`,
        params: {
          page: 1,
          pageSize: 25,
        }
      });
      mockFn.mockClear();
    });

    it("should accept an optional filter", async () => {
      await support.getTickets({}, filter);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets`,
        headers: { 'X-Filter': '{"+order_by":"updated","+order":"desc"}' },
      });
      mockFn.mockClear();
    });
  });

  describe("getTicket method", () => {
    const id = 123456;
    it("should make a get request", async () => {
      await support.getTicket(id);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets/${id}`,
      });
      mockFn.mockClear();
    });

    it("should accept pagination", async () => {
      await support.getTicket(id, pagination);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets/${id}`,
        params: {
          page: 1,
          pageSize: 25,
        }
      });
      mockFn.mockClear();
    });

    it("should accept an optional filter", async () => {
      await support.getTicket(id, {}, {"+status":"open"});
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: `${API_ROOT}/support/tickets/${id}`,
        headers: { 'X-Filter': '{"+status":"open"}' },
      });
      mockFn.mockClear();
    });
  });

  describe("getTicketReplies method", () => {
    const ticketId = 123456;
    const repliesUrl = `${API_ROOT}/support/tickets/${ticketId}/replies`;
    it("should make a get request", async () => {
      await support.getTicketReplies(ticketId);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: repliesUrl,
      });
      mockFn.mockClear();
    });

    it("should accept pagination", async () => {
      await support.getTicketReplies(ticketId, pagination);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: repliesUrl,
        params: {
          page: 1,
          pageSize: 25,
        }
      });
      mockFn.mockClear();
    });

    it("should accept an optional filter", async () => {
      await support.getTicketReplies(ticketId, {}, {"+status":"open"});
      expect(mockFn).toHaveBeenCalledWith({
        method: 'GET',
        url: repliesUrl,
        headers: { 'X-Filter': '{"+status":"open"}' },
      });
      mockFn.mockClear();
    });
  });

  describe("createSupportTicket method", () => {
    const validData = { 
      summary: "This is a ticket",
      description: "This is a description."
    }

    const invalidData = {
      summary: '',
      description: '',
    }

    it("should accept a valid TicketRequest", async () => {
      await support.createSupportTicket(validData);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'POST',
        url: `${API_ROOT}/support/tickets`,
        data: validData,
      })
    });

    // Skip until validation is worked out.
    xit("should throw an error with incorrect data", async () => {
      await support.createSupportTicket(invalidData); // should use invalidData
      expect(mockFn).not.toHaveBeenCalled();
    });
  })

  describe("createReply method", () => {
    const ticketId = 123456;
    const replyUrl = `${API_ROOT}/support/tickets/${ticketId}/replies`;

    const validData = {
      ticket_id: ticketId,
      description: "This is a description."
    }

    const invalidData = {
      ticket_id: ticketId,
      description: '',
    }

    it("should accept a valid ReplyRequest", async () => {
      await support.createReply(validData);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'POST',
        url: replyUrl,
        data: validData,
      })
    });

    // Skip until validation is worked out.
    xit("should throw an error with incorrect data", async () => {
      await support.createReply(invalidData); // should use invalidData
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("uploadAttachment method", () => {
    const ticketId = 123456;
    const filePath = 'usr/local/bin/index.html';
    const data = new FormData();
    const invalidData = new FormData();
    invalidData.append('label','thisLabel');
    data.append('file', filePath);
    it("should accept a file attachment", async () => {
      await support.uploadAttachment(ticketId, data);
      expect(mockFn).toHaveBeenCalledWith({
        method: 'POST',
        url: `${API_ROOT}/support/tickets/${ticketId}/attachments`,
        data,
      })
    })
    xit("should reject invalid form data", async () => {
      await support.uploadAttachment(ticketId, invalidData);
      expect(mockFn).not.toHaveBeenCalled();
    })
  });
})

