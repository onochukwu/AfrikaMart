import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucket: string;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT') || '';
    const s3Config: AWS.S3.ClientConfiguration = {
      accessKeyId: this.config.get<string>('S3_ACCESS_KEY') || undefined,
      secretAccessKey: this.config.get<string>('S3_SECRET_KEY') || undefined,
      region: this.config.get<string>('S3_REGION') || 'us-east-1',
    };
    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.s3ForcePathStyle = true;
    }
    this.s3 = new AWS.S3(s3Config);
    this.bucket = this.config.get<string>('S3_BUCKET') || '';
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };
    const res = (await this.s3.upload(params).promise()) as ManagedUpload.SendData;
    return res.Location;
  }

  async deleteFile(key: string) {
    await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
  }
}
