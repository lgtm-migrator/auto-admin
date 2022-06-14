import { UserEntity } from '../../entities/user/user.entity';
import { TableLogsEntity } from '../../entities/table-logs/table-logs.entity';
import { GroupEntity } from '../../entities/group/group.entity';
import { TableSettingsEntity } from '../../entities/table-settings/table-settings.entity';
import { AgentEntity } from '../../entities/agent/agent.entity';
import { ConnectionPropertiesEntity } from '../../entities/connection-properties/connection-properties.entity';

export interface IEncryptorInterfaceDTO {
  id: string;
  title?: string;
  masterEncryption: boolean;
  type?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  schema?: string;
  sid?: string;
  createdAt: Date;
  updatedAt: Date;
  ssh?: boolean;
  privateSSHKey?: string;
  sshHost?: string;
  sshPort?: number;
  sshUsername?: string;
  ssl?: boolean;
  cert?: string;
  updateTimestampEncryptCredentials: () => void;
  encryptCredentials: () => void;
  decryptCredentials: () => void;
  author: UserEntity;
  groups: Array<GroupEntity>;
  settings: Array<TableSettingsEntity>;
  logs: Array<TableLogsEntity>;
  agent: AgentEntity;
  isTestConnection?: boolean;
  connection_properties: ConnectionPropertiesEntity;
}
