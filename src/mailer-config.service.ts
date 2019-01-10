import { Injectable } from '@nestjs/common';
import { MailerOptionsFactory, MailerModuleOptions } from '@nest-modules/mailer';
import { ConfigService } from '@sierralabs/nest-utils';
import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
const defaultConfig = require('../config/config.json');

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createMailerOptions(): MailerModuleOptions {
    const emailConfig = this.getEmailConfig();
    let options: MailerModuleOptions = {
      defaults: {
        forceEmbeddedImages: emailConfig.forceEmbeddedImages,
        from: emailConfig.from
      },
      templateDir: emailConfig.templateDir,
      templateOptions: {
        engine: emailConfig.templateEngine
      }
    };

    if (emailConfig.settings) {
      if (emailConfig.settings.SES) {
        let aws = this.configService.get('aws');
        AWS.config.update({
          region: process.env.AWS_REGION || aws.region,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || aws.accessKeyId,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || aws.secretAccessKey
        });
        options.transport = {
          SES: new AWS.SES({ apiVersion: 'latest' })
        };
      } else {
        options.transport = emailConfig.settings;
        if (!options.transport.auth) {
          // if no auth credentials in config check env
          options.transport.auth = {
            user: process.env.EMAIL_SETTINGS_USER,
            pass: process.env.EMAIL_SETTINGS_PASS
          }
        }
      }
    }
    return options;
  }


  private getEmailConfig(): any {
    const defaultEmailConfig = _.clone(defaultConfig.email);
    const emailConfig = this.configService.get('email');
    if (emailConfig) {
      return _.assign(defaultEmailConfig, emailConfig);
    }
    return defaultEmailConfig;
  }
}
