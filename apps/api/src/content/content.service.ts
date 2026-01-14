import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, GridFSFile, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import type { Response } from 'express';
import { DataService } from '@/data/data.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import type { ContentType, User } from '@/data/data.types';

@Injectable()
export class ContentService {
  private readonly bucket: GridFSBucket;
  private readonly db: any;

  constructor(
    private readonly data: DataService,
    @InjectConnection() connection: Connection,
  ) {
    if (!connection.db) {
      throw new Error('MongoDB connection is not available');
    }
    this.db = connection.db;
    this.bucket = new GridFSBucket(this.db, {
      bucketName: process.env.CONTENT_BUCKET ?? 'content_files',
    });
  }

  async list() {
    const items = await this.data.getContent();
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      price: item.price,
      lessons: item.lessons,
      type: item.type,
      locked: item.price > 0,
      fileSize: item.fileSize,
    }));
  }

  async detail(id: string) {
    const item = await this.data.getContentById(id);
    if (!item) {
      throw new NotFoundException('Content not found');
    }
    return item;
  }

  async purchased(userId: string) {
    const user = await this.data.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const items = await this.data.getPurchasedContent(user);
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      lessons: item.lessons,
      type: item.type,
      fileName: item.fileName,
      fileSize: item.fileSize,
    }));
  }

  async create(dto: CreateContentDto) {
    return this.data.createContent({
      ...dto,
      type: dto.type ?? 'other',
    });
  }

  async upload(dto: CreateContentDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty');
    }

    const detectedType = dto.type ?? this.detectType(file.mimetype);
    const storedFile = await this.storeFile(file);

    return this.data.createContent({
      ...dto,
      type: detectedType,
      fileId: storedFile._id.toString(),
      fileName: storedFile.filename ?? file.originalname,
      fileType: storedFile.contentType ?? file.mimetype,
      fileSize: storedFile.length ?? file.size,
    });
  }

  async update(id: string, dto: UpdateContentDto) {
    const item = await this.data.updateContent(id, dto);
    if (!item) {
      throw new NotFoundException('Content not found');
    }
    return item;
  }

  async remove(id: string) {
    const deleted = await this.data.deleteContent(id);
    if (!deleted) {
      throw new NotFoundException('Content not found');
    }
    if (deleted.fileId) {
      await this.deleteFile(deleted.fileId);
    }
    return { success: true };
  }

  async streamFile(contentId: string, user: User, res: Response) {
    const content = await this.data.getContentById(contentId);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    if (!content.fileId) {
      throw new NotFoundException('No file has been uploaded for this content');
    }

    const hasAccess = await this.data.hasAccessToContent(user, contentId);
    if (!hasAccess) {
      throw new ForbiddenException('Please purchase this content to download the file.');
    }

    const objectId = this.asObjectId(content.fileId);
    res.set({
      'Content-Type': content.fileType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${content.fileName ?? 'content'}"`,
    });

    await new Promise<void>((resolve, reject) => {
      const downloadStream = this.bucket.openDownloadStream(objectId);
      downloadStream.on('error', () => reject(new NotFoundException('File not found')));
      downloadStream.on('end', () => resolve());
      downloadStream.pipe(res);
    });
  }

  private async storeFile(file: Express.Multer.File): Promise<GridFSFile> {
    return new Promise<GridFSFile>((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });
      
      const fileId = uploadStream.id; // Store the ID before piping
      const bucketName = process.env.CONTENT_BUCKET ?? 'content_files';
      
      uploadStream.on('error', reject);
      uploadStream.on('finish', async () => {
        try {
          // Query the GridFS files collection to get the full file metadata
          const filesCollection = this.db.collection(`${bucketName}.files`);
          const gridFSFile = await filesCollection.findOne({ _id: fileId });
          
          if (!gridFSFile) {
            reject(new Error('Failed to retrieve uploaded file metadata'));
            return;
          }
          
          resolve(gridFSFile as GridFSFile);
        } catch (error) {
          reject(error);
        }
      });
      
      Readable.from(file.buffer)
        .pipe(uploadStream)
        .on('error', reject);
    });
  }

  private async deleteFile(fileId: string) {
    try {
      await this.bucket.delete(this.asObjectId(fileId));
    } catch {
      // Ignore missing files
    }
  }

  private asObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new NotFoundException('Invalid file identifier');
    }
  }

  private detectType(mime: string): ContentType {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('word') || mime.includes('msword') || mime.includes('doc')) return 'docx';
    if (mime.includes('presentation') || mime.includes('powerpoint')) return 'pptx';
    if (mime.includes('text')) return 'txt';
    if (mime.includes('audio')) return 'audio';
    if (mime.includes('video')) return 'video';
    if (mime.includes('epub')) return 'epub';
    return 'other';
  }
}