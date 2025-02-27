import { UpdateTableActionDS } from '../application/data-sctructures/update-table-action.ds';
import { CreateTableActionDTO } from '../dto/create-table-action.dto';
import { TableActionEntity } from '../table-action.entity';

export function buildNewTableActionEntity(actionData: CreateTableActionDTO | UpdateTableActionDS): TableActionEntity {
  const newTableAction = new TableActionEntity();
  newTableAction.title = actionData.title;
  newTableAction.type = actionData.type;
  newTableAction.url = actionData.url;
  return newTableAction;
}
