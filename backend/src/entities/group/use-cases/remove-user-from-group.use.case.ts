import { HttpException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import AbstractUseCase from '../../../common/abstract-use.case';
import { AddUserInGroupDs } from '../application/data-sctructures/add-user-in-group.ds';
import { RemoveUserFromGroupResultDs } from '../application/data-sctructures/remove-user-from-group-result.ds';
import { IRemoveUserFromGroup } from './use-cases.interfaces';
import { BaseType } from '../../../common/data-injection.tokens';
import { IGlobalDatabaseContext } from '../../../common/application/global-database-context.intarface';
import { Messages } from '../../../exceptions/text/messages';
import { buildRemoveUserFromGroupResultDs } from '../utils/build-remove-user-from-group-result.ds';

@Injectable()
export class RemoveUserFromGroupUseCase
  extends AbstractUseCase<AddUserInGroupDs, RemoveUserFromGroupResultDs>
  implements IRemoveUserFromGroup
{
  constructor(
    @Inject(BaseType.GLOBAL_DB_CONTEXT)
    protected _dbContext: IGlobalDatabaseContext,
  ) {
    super();
  }

  protected async implementation(inputData: AddUserInGroupDs): Promise<RemoveUserFromGroupResultDs> {
    const { groupId, email } = inputData;
    const foundUser = await this._dbContext.userRepository.findOneUserByEmail(email);
    if (!foundUser) {
      throw new HttpException(
        {
          message: Messages.USER_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const groupToUpdate = await this._dbContext.groupRepository.findGroupById(groupId);
    if (groupToUpdate.isMain && groupToUpdate.users.length <= 1) {
      throw new HttpException(
        {
          message: Messages.CANT_DELETE_LAST_USER,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const usersArray = groupToUpdate.users;
    const delIndex = usersArray
      .map(function (e) {
        return e.id;
      })
      .indexOf(foundUser.id);
    groupToUpdate.users.splice(delIndex, 1);
    const updatedGroup = await this._dbContext.groupRepository.saveNewOrUpdatedGroup(groupToUpdate);
    return buildRemoveUserFromGroupResultDs(updatedGroup);
  }
}
