import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
// const streamifier = require('streamifier');
import * as streamifier from 'streamifier';
import { USER_AVATAR_IMAGES_FOLDER } from './constants';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  uploadFile(
    file: Express.Multer.File,
    folder: string = USER_AVATAR_IMAGES_FOLDER,
  ) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
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

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Error deleting file from Cloudinary: ${error}`);
    }
  }

  async deleteFileByUrl(url: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(url);
    await cloudinary.uploader.destroy(publicId);
  }

  private extractPublicIdFromUrl(url: string): string {
    const parts = url.split('/');
    const fileWithExtension = parts.pop(); // image.webp
    const folder = parts.pop(); // folder
    const fileName = fileWithExtension!.split('.')[0];
    return `${folder}/${fileName}`;
  }
}
