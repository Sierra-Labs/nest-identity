import * as AWS from 'aws-sdk';
import * as _ from 'lodash';

import { MailerOptions, MailerOptionsFactory } from '@nest-modules/mailer';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@sierralabs/nest-utils';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    const emailConfig = this.getEmailConfig();
    const options: MailerOptions = {
      defaults: {
        forceEmbeddedImages: emailConfig.forceEmbeddedImages,
        from: emailConfig.from,
      },
      template: {
        dir: emailConfig.templateDir,
        options: {
          engine: emailConfig.templateEngine,
        },
      },
    };

    if (emailConfig.settings) {
      if (emailConfig.settings.SES) {
        const aws = this.configService.get('aws');
        AWS.config.update({
          region: process.env.AWS_REGION || aws.region,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || aws.accessKeyId,
          secretAccessKey:
            process.env.AWS_SECRET_ACCESS_KEY || aws.secretAccessKey,
        });
        options.transport = {
          SES: new AWS.SES({ apiVersion: 'latest' }),
        };
      } else {
        options.transport = emailConfig.settings;
        if (!options.transport.auth) {
          // if no auth credentials in config check env
          options.transport.auth = {
            user: process.env.EMAIL_SETTINGS_USER,
            pass: process.env.EMAIL_SETTINGS_PASS,
          };
        }
      }
    }
    return options;
  }

  private getEmailConfig(): any {
    const emailConfig = this.configService.get('email');
    if (!emailConfig) {
      throw new NotImplementedException('`email` settings missing from config');
    }
    return emailConfig;
  }
}
