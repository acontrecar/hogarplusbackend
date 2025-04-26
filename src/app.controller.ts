import {
  Controller,
  // Controller,
  Get,
  // Post,
  // UploadedFile,
  // UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
// import { CloudinaryService } from './cloudinary/cloudinary.service';
// import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadTest(@UploadedFile() file: Express.Multer.File) {
  //   const result = await this.cloudinaryService.uploadFile(file);
  //   return result;
  // }
}
