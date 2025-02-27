import validator from 'validator';
import { Constants } from '../constants/constants';
import { Messages } from '../../exceptions/text/messages';
import { buildBadRequestException } from '../../guards/utils';

export class ValidationHelper {
  public static isValidEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  public static isValidUUID(uuid: string): boolean {
    return validator.isUUID(uuid);
  }

  public static isValidVerificationString(verificationString: string): boolean {
    return validator.isWhitelisted(verificationString, Constants.VERIFICATION_STRING_WHITELIST());
  }

  public static isValidJWT(token: string): boolean {
    return validator.isJWT(token);
  }

  public static validateOrThrowHttpExceptionEmail(email: string): boolean {
    const isEmailValid = ValidationHelper.isValidEmail(email);
    if (isEmailValid) {
      return true;
    }
    throw buildBadRequestException(Messages.EMAIL_INVALID);
  }

  public static validateOrThrowHttpExceptionUUID(uuid: string): boolean {
    const isValidUUID = ValidationHelper.isValidUUID(uuid);
    if (isValidUUID) {
      return true;
    }
    throw buildBadRequestException(Messages.UUID_INVALID);
  }

  public static validateOrThrowHttpExceptionVerificationString(verificationString: string): boolean {
    const isVerificationStringValid = ValidationHelper.isValidVerificationString(verificationString);
    if (isVerificationStringValid) {
      return true;
    }
    throw buildBadRequestException(Messages.VERIFICATION_STRING_INCORRECT);
  }

  public static validateOrThrowHttpExceptionJWT(token: string): boolean {
    const isJWTValid = ValidationHelper.isValidJWT(token);
    if (isJWTValid) {
      return true;
    }
    throw buildBadRequestException(Messages.INVALID_JWT_TOKEN);
  }
}
