import { TableSettingsEntity } from '../../table-settings/table-settings.entity';
import { TableActionEntity } from '../table-action.entity';
import { ITableActionRepository } from './table-action-custom-reposiotory.interface';

export const tableActionsCustomRepositoryExtension: ITableActionRepository = {
  async saveNewOrOupdatedTableAction(action: TableActionEntity): Promise<TableActionEntity> {
    return await this.save(action);
  },

  async findTableActions(connectionId: string, tableName: string): Promise<Array<TableActionEntity>> {
    const qb = this.manager
      .getRepository(TableSettingsEntity)
      .createQueryBuilder('tableSettings')
      .leftJoinAndSelect('tableSettings.table_actions', 'table_actions');
    qb.where('tableSettings.connection_id = :connection_id', { connection_id: connectionId });
    qb.andWhere('tableSettings.table_name = :table_name', { table_name: tableName });
    const result = await qb.getOne();
    return result?.table_actions ? result.table_actions : [];
  },

  async findTableActionById(actionId: string): Promise<TableActionEntity> {
    return await this.findOne({ where: { id: actionId } });
  },

  async deleteTableActionUseCase(action: TableActionEntity): Promise<TableActionEntity> {
    return await this.remove(action);
  },
};
