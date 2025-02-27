import { HttpException, HttpStatus } from '@nestjs/common';
import { createDataAccessObject } from '../../../data-access-layer/shared/create-data-access-object';
import { AccessLevelEnum, PermissionTypeEnum } from '../../../enums';
import { Messages } from '../../../exceptions/text/messages';
import { Encryptor } from '../../../helpers/encryption/encryptor';
import { ConnectionEntity } from '../../connection/connection.entity';
import { PermissionEntity } from '../../permission/permission.entity';
import { ITablePermissionData } from '../../permission/permission.interface';

export const userAccessCustomReposiotoryExtension = {
  async getUserConnectionAccessLevel(cognitoUserName: string, connectionId: string): Promise<AccessLevelEnum> {
    const qb = this.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.groups', 'group')
      .leftJoinAndSelect('group.users', 'user')
      .leftJoinAndSelect('group.connection', 'connection')
      .andWhere('connection.id = :connectionId', { connectionId: connectionId })
      .andWhere('user.id = :cognitoUserName', { cognitoUserName: cognitoUserName })
      .andWhere('permission.type = :permissionType', { permissionType: PermissionTypeEnum.Connection });
    const resultPermissions = await qb.getMany();
    if (resultPermissions?.length === 0) {
      return AccessLevelEnum.none;
    }
    const connectionAccessLevels = resultPermissions.map((permission: PermissionEntity) => {
      return permission.accessLevel.toLowerCase();
    });
    if (
      connectionAccessLevels.includes(AccessLevelEnum.fullaccess) ||
      connectionAccessLevels.includes(AccessLevelEnum.edit)
    ) {
      return AccessLevelEnum.edit;
    }
    if (connectionAccessLevels.includes(AccessLevelEnum.readonly)) {
      return AccessLevelEnum.readonly;
    }
    return AccessLevelEnum.none;
  },

  async checkUserConnectionRead(cognitoUserName: string, connectionId: string): Promise<boolean> {
    const connectionAccessLevel = await this.getUserConnectionAccessLevel(cognitoUserName, connectionId);
    switch (connectionAccessLevel) {
      case AccessLevelEnum.edit:
      case AccessLevelEnum.fullaccess:
      case AccessLevelEnum.readonly:
        return true;
      default:
        return false;
    }
  },

  async checkUserConnectionEdit(cognitoUserName: string, connectionId: string): Promise<boolean> {
    const connectionAccessLevel = await this.getUserConnectionAccessLevel(cognitoUserName, connectionId);
    switch (connectionAccessLevel) {
      case AccessLevelEnum.edit:
      case AccessLevelEnum.fullaccess:
        return true;
      case AccessLevelEnum.readonly:
        return false;
      default:
        return false;
    }
  },

  async getGroupAccessLevel(cognitoUserName: string, groupId: string): Promise<AccessLevelEnum> {
    const connectionId = await this.getConnectionId(groupId);
    const userConnectionAccessLevel = await this.checkUserConnectionEdit(cognitoUserName, connectionId);
    if (userConnectionAccessLevel) {
      return AccessLevelEnum.edit;
    }
    const qb = this.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.groups', 'group')
      .leftJoinAndSelect('group.users', 'user')
      .leftJoinAndSelect('group.connection', 'connection')
      .andWhere('connection.id = :connectionId', { connectionId: connectionId })
      .andWhere('user.id = :cognitoUserName', { cognitoUserName: cognitoUserName })
      .andWhere('permission.type = :permissionType', { permissionType: PermissionTypeEnum.Group })
      .andWhere('group.id = :groupId', { groupId: groupId });
    const resultPermissions = await qb.getMany();
    if (resultPermissions?.length === 0) {
      return AccessLevelEnum.none;
    }
    const connectionAccessLevels = resultPermissions.map((permission: PermissionEntity) => {
      return permission.accessLevel.toLowerCase();
    });
    if (
      connectionAccessLevels.includes(AccessLevelEnum.fullaccess) ||
      connectionAccessLevels.includes(AccessLevelEnum.edit)
    ) {
      return AccessLevelEnum.edit;
    }
    if (connectionAccessLevels.includes(AccessLevelEnum.readonly)) {
      return AccessLevelEnum.readonly;
    }
    return AccessLevelEnum.none;
  },

  async checkUserGroupRead(cognitoUserName: string, groupId: string): Promise<boolean> {
    const userGroupAccessLevel = await this.getGroupAccessLevel(cognitoUserName, groupId);
    switch (userGroupAccessLevel) {
      case AccessLevelEnum.edit:
      case AccessLevelEnum.fullaccess:
      case AccessLevelEnum.readonly:
        return true;
      default:
        return false;
    }
  },

  async checkUserGroupEdit(cognitoUserName: string, groupId: string): Promise<boolean> {
    const userGroupAccessLevel = await this.getGroupAccessLevel(cognitoUserName, groupId);
    switch (userGroupAccessLevel) {
      case AccessLevelEnum.edit:
      case AccessLevelEnum.fullaccess:
        return true;
      case AccessLevelEnum.readonly:
        return false;
      default:
        return false;
    }
  },

  async getUserTablePermissions(
    cognitoUserName: string,
    connectionId: string,
    tableName: string,
    masterPwd: string,
  ): Promise<ITablePermissionData> {
    const connectionQB = this.manager
      .getRepository(ConnectionEntity)
      .createQueryBuilder('connection')
      .leftJoinAndSelect('connection.agent', 'agent');
    connectionQB.andWhere('connection.id = :id', { id: connectionId });

    let foundConnection: ConnectionEntity = await connectionQB.getOne();
    if (!foundConnection) {
      throw new HttpException(
        {
          message: Messages.CONNECTION_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (foundConnection.masterEncryption && !masterPwd) {
      throw new HttpException(
        {
          message: Messages.MASTER_PASSWORD_MISSING,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (foundConnection.masterEncryption) {
      foundConnection = Encryptor.decryptConnectionCredentials(foundConnection, masterPwd);
    }
    const dao = createDataAccessObject(foundConnection, cognitoUserName);
    const availableTables = await dao.getTablesFromDB();
    if (availableTables.indexOf(tableName) < 0) {
      throw new HttpException(
        {
          message: Messages.TABLE_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const connectionEdit = await this.checkUserConnectionEdit(cognitoUserName, connectionId);
    if (connectionEdit) {
      return {
        tableName: tableName,
        accessLevel: {
          visibility: true,
          readonly: false,
          add: true,
          delete: true,
          edit: true,
        },
      };
    }

    const qb = this.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.groups', 'group')
      .leftJoinAndSelect('group.users', 'user')
      .leftJoinAndSelect('group.connection', 'connection')
      .andWhere('connection.id = :connectionId', { connectionId: connectionId })
      .andWhere('user.id = :cognitoUserName', { cognitoUserName: cognitoUserName })
      .andWhere('permission.type = :permissionType', { permissionType: PermissionTypeEnum.Table })
      .andWhere('permission.tableName = :tableName', { tableName: tableName });
    const resultPermissions = await qb.getMany();
    const tableAccessLevels = resultPermissions.map((permission: PermissionEntity) => {
      return permission.accessLevel;
    });
    const addPermission = tableAccessLevels.includes(AccessLevelEnum.add);
    const deletePermission = tableAccessLevels.includes(AccessLevelEnum.delete);
    const editPermission = tableAccessLevels.includes(AccessLevelEnum.edit);
    const readOnly = !(addPermission || deletePermission || editPermission);
    return {
      tableName: tableName,
      accessLevel: {
        visibility: tableAccessLevels.includes(AccessLevelEnum.visibility),
        readonly: tableAccessLevels.includes(AccessLevelEnum.readonly) && !readOnly,
        add: addPermission,
        delete: deletePermission,
        edit: editPermission,
      },
    };
  },

  async getUserPermissionsForAvailableTables(
    cognitoUserName: string,
    connectionId: string,
    tableNames: Array<string>,
  ): Promise<Array<ITablePermissionData>> {
    const connectionEdit = await this.checkUserConnectionEdit(cognitoUserName, connectionId);
    const tablesWithPermissionsArr = [];
    if (connectionEdit) {
      for (const tableName of tableNames) {
        tablesWithPermissionsArr.push({
          tableName: tableName,
          accessLevel: {
            visibility: true,
            readonly: false,
            add: true,
            delete: true,
            edit: true,
          },
        });
      }
      return tablesWithPermissionsArr;
    }

    const qb = this.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.groups', 'group')
      .leftJoinAndSelect('group.users', 'user')
      .leftJoinAndSelect('group.connection', 'connection')
      .andWhere('connection.id = :connectionId', { connectionId: connectionId })
      .andWhere('user.id = :cognitoUserName', { cognitoUserName: cognitoUserName })
      .andWhere('permission.type = :permissionType', { permissionType: PermissionTypeEnum.Table });
    const allTablePermissions = await qb.getMany();
    const tablesAndAccessLevels = {};
    for (const tableName of tableNames) {
      if (tableName !== '__proto__') {
        // eslint-disable-next-line security/detect-object-injection
        tablesAndAccessLevels[tableName] = [];
      }
    }
    for (const tableName of tableNames) {
      for (const permission of allTablePermissions) {
        if (permission.tableName === tableName && tablesAndAccessLevels.hasOwnProperty(tableName)) {
          // eslint-disable-next-line security/detect-object-injection
          tablesAndAccessLevels[tableName].push(permission.accessLevel);
        }
      }
    }
    for (const key in tablesAndAccessLevels) {
      if (tablesAndAccessLevels.hasOwnProperty(key)) {
        // eslint-disable-next-line security/detect-object-injection
        const addPermission = tablesAndAccessLevels[key].includes(AccessLevelEnum.add);
        // eslint-disable-next-line security/detect-object-injection
        const deletePermission = tablesAndAccessLevels[key].includes(AccessLevelEnum.delete);
        // eslint-disable-next-line security/detect-object-injection
        const editPermission = tablesAndAccessLevels[key].includes(AccessLevelEnum.edit);
        const readOnly = !(addPermission || deletePermission || editPermission);
        tablesWithPermissionsArr.push({
          tableName: key,
          accessLevel: {
            // eslint-disable-next-line security/detect-object-injection
            visibility: tablesAndAccessLevels[key].includes(AccessLevelEnum.visibility),
            // eslint-disable-next-line security/detect-object-injection
            readonly: tablesAndAccessLevels[key].includes(AccessLevelEnum.readonly) && !readOnly,
            add: addPermission,
            delete: deletePermission,
            edit: editPermission,
          },
        });
      }
    }
    return tablesWithPermissionsArr.filter((tableWithPermission: ITablePermissionData) => {
      return !!tableWithPermission.accessLevel.visibility;
    });
  },

  async checkTableRead(
    cognitoUserName: string,
    connectionId: string,
    tableName: string,
    masterPwd: string,
  ): Promise<boolean> {
    const { accessLevel } = await this.getUserTablePermissions(cognitoUserName, connectionId, tableName, masterPwd);
    switch (true) {
      case accessLevel.visibility:
      case accessLevel.add:
      case accessLevel.delete:
      case accessLevel.edit:
        return true;
      default:
        return false;
    }
  },

  async checkTableAdd(
    cognitoUserName: string,
    connectionId: string,
    tableName: string,
    masterPwd: string,
  ): Promise<boolean> {
    const { accessLevel } = await this.getUserTablePermissions(cognitoUserName, connectionId, tableName, masterPwd);
    return accessLevel.visibility && accessLevel.add;
  },

  async checkTableDelete(
    cognitoUserName: string,
    connectionId: string,
    tableName: string,
    masterPwd: string,
  ): Promise<boolean> {
    const { accessLevel } = await this.getUserTablePermissions(cognitoUserName, connectionId, tableName, masterPwd);
    return accessLevel.visibility && accessLevel.delete;
  },

  async checkTableEdit(
    cognitoUserName: string,
    connectionId: string,
    tableName: string,
    masterPwd: string,
  ): Promise<boolean> {
    const { accessLevel } = await this.getUserTablePermissions(cognitoUserName, connectionId, tableName, masterPwd);
    return accessLevel.visibility && accessLevel.edit;
  },

  async getConnectionId(groupId: string): Promise<string> {
    const connectionRepository = this.manager.getRepository(ConnectionEntity);
    const qb = connectionRepository.createQueryBuilder('connection').leftJoinAndSelect('connection.groups', 'group');
    qb.andWhere('group.id = :id', { id: groupId });
    const sql = qb.getSql();
    const connection = await qb.getOne();
    if (!connection) {
      throw new HttpException(
        {
          message: Messages.CONNECTION_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return connection.id;
  },
};
