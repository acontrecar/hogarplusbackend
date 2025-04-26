import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
// const streamifier = require('streamifier');
import * as streamifier from 'streamifier';
import { USER_AVATAR_IMAGES_FOLDER } from './constants';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: USER_AVATAR_IMAGES_FOLDER,
          quality: 'auto',
          format: 'webp',
          transformation: [{ width: 500, crop: 'limit' }],
        },
        (error, result) => {
          if (error || !result)
            return reject(
              error || new Error('No result returned from Cloudinary'),
            );
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
