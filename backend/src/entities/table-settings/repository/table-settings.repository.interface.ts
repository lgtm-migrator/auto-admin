import { CreateTableSettingsDs } from '../application/data-structures/create-table-settings.ds';
import { TableSettingsEntity } from '../table-settings.entity';

export interface ITableSettingsRepository {
  saveNewOrUpdatedSettings(settings: TableSettingsEntity): Promise<TableSettingsEntity>;

  findTableSettingsWithCustomFields(connectionId: string, tableName: string): Promise<TableSettingsEntity>;

  createNewTableSettings(settings: CreateTableSettingsDs): Promise<TableSettingsEntity>;

  findTableSettings(connectionId: string, tableName: string): Promise<TableSettingsEntity>;

  findTableSettingsOrReturnEmpty(connectionId: string, tableName: string): Promise<any>;

  removeTableSettings(tableSettings: TableSettingsEntity): Promise<TableSettingsEntity>;

  findTableSettingsInConnection(connectionId: string): Promise<Array<TableSettingsEntity>>;

  findTableSettingsWithTableWidgets(connectionId: string, tableName: string): Promise<TableSettingsEntity>;

  findTableSettingsWithTableActions(connectionId: string, tableName: string): Promise<TableSettingsEntity>;
}
