import { Repository } from 'typeorm';
import { IAgentRepository } from '../../entities/agent/repository/agent.repository.interface';
import { IConnectionPropertiesRepository } from '../../entities/connection-properties/repository/connection-properties.repository.interface';
import { IConnectionRepository } from '../../entities/connection/repository/connection.repository.interface';
import { ICustomFieldsRepository } from '../../entities/custom-field/repository/custom-fields-repository.interface';
import { IEmailVerificationRepository } from '../../entities/email/repository/email-verification.repository.interface';
import { IGroupRepository } from '../../entities/group/repository/group.repository.interface';
import { ILogOutRepository } from '../../entities/log-out/repository/log-out-repository.interface';
import { IPermissionRepository } from '../../entities/permission/repository/permission.repository.interface';
import { ITableActionRepository } from '../../entities/table-actions/repository/table-action-custom-reposiotory.interface';
import { TableFieldInfoEntity } from '../../entities/table-field-info/table-field-info.entity';
import { TableInfoEntity } from '../../entities/table-info/table-info.entity';
import { ITableLogsRepository } from '../../entities/table-logs/repository/table-logs-repository.interface';
import { ITableSettingsRepository } from '../../entities/table-settings/repository/table-settings.repository.interface';
import { IUserAccessRepository } from '../../entities/user-access/repository/user-access.repository.interface';
import { IUserActionRepository } from '../../entities/user-actions/repository/user-action.repository.interface';
import { IUserRepository } from '../../entities/user/repository/user.repository.interface';
import { IEmailChangeRepository } from '../../entities/user/user-email/repository/email-change.repository.interface';
import { IUserInvitationRepository } from '../../entities/user/user-invitation/repository/user-invitation-repository.interface';
import { IPasswordResetRepository } from '../../entities/user/user-password/repository/password-reset-repository.interface';
import { ITableWidgetsRepository } from '../../entities/widget/repository/table-widgets-repository.interface';
import { IDatabaseContext } from '../database-context.interface';

export interface IGlobalDatabaseContext extends IDatabaseContext {
  userRepository: IUserRepository;
  connectionRepository: IConnectionRepository;
  groupRepository: IGroupRepository;
  permissionRepository: IPermissionRepository;
  tableSettingsRepository: ITableSettingsRepository;
  userAccessRepository: IUserAccessRepository;
  agentRepository: IAgentRepository;
  emailVerificationRepository: IEmailVerificationRepository;
  passwordResetRepository: IPasswordResetRepository;
  emailChangeRepository: IEmailChangeRepository;
  userInvitationRepository: IUserInvitationRepository;
  connectionPropertiesRepository: IConnectionPropertiesRepository;
  customFieldsRepository: ICustomFieldsRepository;
  tableLogsRepository: ITableLogsRepository;
  userActionRepository: IUserActionRepository;
  logOutRepository: ILogOutRepository;
  tableWidgetsRepository: ITableWidgetsRepository;
  tableInfoRepository: Repository<TableInfoEntity>;
  tableFieldInfoRepository: Repository<TableFieldInfoEntity>;
  tableActionRepository: ITableActionRepository;
}
