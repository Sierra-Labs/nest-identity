import { Injectable } from '@nestjs/common';
import { MailerOptionsFactory, MailerModuleOptions } from '@nest-modules/mailer';
import { ConfigService } from '@sierralabs/nest-utils';
import * as AWS from 'aws-sdk';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createMailerOptions(): MailerModuleOptions {
    let emailSettings = this.configService.get('email.settings');
    let options: MailerModuleOptions = {
      defaults: {
        forceEmbeddedImages: this.configService.get('email.forceEmbeddedImages') || process.env.EMAIL_FORCE_EMBEDDED_IMAGES,
        from: this.configService.get('email.from') || process.env.EMAIL_FROM,
      },
      templateDir: this.configService.get('email.templateDir') || process.env.EMAIL_TEMPLATE_DIR,
      templateOptions: {
        engine: this.configService.get('email.templateEngine') || process.env.EMAIL_TEMPLATE_ENGINE,
      }
    };
    if (emailSettings.SES) { // use aws client credential
      AWS.config.update({
        region: this.configService.get('aws.region') || process.env.AWS_REGION,
        accessKeyId: this.configService.get('aws.accessKeyId') || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.configService.get('aws.secretAccessKey') || process.env.AWS_SECRET_ACCESS_KEY,
      });
      options.transport = {
        SES: new AWS.SES({ apiVersion: 'latest' })
      };
    } else { // smtp/sendmail/stream config object or string
      options.transport = emailSettings;
    }
    return options;
  }
}
