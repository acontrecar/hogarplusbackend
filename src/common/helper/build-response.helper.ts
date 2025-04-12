// import { HttpStatus } from '@nestjs/common';
// import { GlobalApiResponse } from '../filters/all-exceptions/interfaces/global-api-response.interface';

import { GlobalApiResponse } from '../filters/all-exceptions/interfaces/global-api-response.interface';

// export const buildResponse = <T>(
//   data: T,
//   message = 'Success',
//   path = '',
//   statusCode: number = HttpStatus.OK,
// ): GlobalApiResponse<T> => {
//   return {
//     statusCode,
//     path,
//     message,
//     data,
//   };
// };

export const buildResponse = <T>(
  data: T,
  path: string,
  message = 'Success',
  statusCode = 200,
  ok: boolean = true,
): GlobalApiResponse<T> => {
  return {
    ok,
    statusCode,
    path,
    message,
    data,
  };
};
