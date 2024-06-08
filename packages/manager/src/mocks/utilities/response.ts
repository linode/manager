import { HttpResponse } from 'msw';
import type { JsonBodyType } from 'msw';
import type { APIError } from '@linode/api-v4';

export interface APIPaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

export interface APIErrorResponse {
  errors: APIError[];
}

export const makeResponse = <T extends JsonBodyType>(
  body: T,
  status: number = 200,
  headers: {} = {}
) => {
  return HttpResponse.json(body, {
    status,
    headers,
  });
};

export const makeErrorResponse = (
  reason: string | string[] = 'An unexpected error occurred.',
  status: number = 400,
  headers: {} = {}
) => {
  const reasonsArray = Array.isArray(reason) ? reason : [reason];
  return HttpResponse.json(
    {
      errors: reasonsArray.map((reasonString) => ({
        reason: reasonString,
      })),
    },
    {
      status,
      headers,
    }
  );
};

export const makePaginatedResponse = <T extends JsonBodyType>(
  data: T | T[],
  page: number = 1,
  totalPages: number = 1
) => {
  const dataArray = Array.isArray(data) ? data : [data];
  return HttpResponse.json({
    data: dataArray,
    page,
    pages: totalPages,
    results: dataArray.length,
  });
};

export const makeNotFoundResponse = () => {
  return makeErrorResponse('Not found', 404);
};
