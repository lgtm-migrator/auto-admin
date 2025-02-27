import * as Amplitude from '@amplitude/node';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmplitudeEventTypeEnum } from '../../enums';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AmplitudeService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async formAndSendLogRecord(event_type: AmplitudeEventTypeEnum, user_id: string, options = null) {
    try {
      if (process.env.NODE_ENV === 'test') return;
      let user_email = (await this.userRepository.findOne({ where: { id: user_id } })).email;
      if (!user_email) {
        user_email = options?.user_email;
      }
      let event_properties = undefined;
      if (user_email) {
        event_properties = {
          user_properties: {
            email: user_email ? user_email : 'unknown',
            tablesCount: options?.tablesCount ? options.tablesCount : undefined,
            reason: options?.reason ? options?.reason : undefined,
            message: options?.message ? options.message : undefined,
          },
        };
      }
      await this.sendLog(event_type, user_id, event_properties);
      /* eslint-enable */
    } catch (e) {
      console.error('Failed to send log: ' + e);
    }
  }

  private async sendLog(eventType, cognitoUserName, eventProperties) {
    const client = Amplitude.init(process.env.AMPLITUDE_API_KEY);
    try {
      client
        .logEvent({
          /* eslint-disable */
          event_type: eventType,
          user_id: cognitoUserName,
          event_properties: eventProperties ? eventProperties : undefined,
          /* eslint-enable */
        })
        .catch((e) => {
          throw new Error(e);
        });
      client.flush().catch((e) => {
        throw new Error(e);
      });
    } catch (e) {
      console.error(e);
    }
  }
}
