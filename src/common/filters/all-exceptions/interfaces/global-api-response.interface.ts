export interface GlobalApiResponse<T = any> {
  ok: boolean;
  statusCode: number;
  path: string;
  message: string;
  data: T;
}
