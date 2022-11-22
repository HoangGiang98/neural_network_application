export interface BmMLApiResponse<T = any> {
  status?: number;
  ok: boolean;
  controller?: string;
  errorType?: string;
  message: string;
  data?: T;
}

export enum BmMLHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
