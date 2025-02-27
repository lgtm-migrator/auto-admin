import { CreateTableSettingsDs } from '../application/data-structures/create-table-settings.ds';

export function buildEmptyTableSettings(connectionId: string, tableName: string): CreateTableSettingsDs {
  return {
    autocomplete_columns: undefined,
    columns_view: undefined,
    connection_id: connectionId,
    custom_fields: undefined,
    display_name: undefined,
    excluded_fields: undefined,
    identification_fields: undefined,
    identity_column: undefined,
    list_fields: undefined,
    list_per_page: undefined,
    masterPwd: undefined,
    ordering: undefined,
    ordering_field: undefined,
    readonly_fields: undefined,
    search_fields: undefined,
    sortable_by: undefined,
    table_name: tableName,
    table_widgets: undefined,
    table_actions: undefined,
    userId: undefined,
    can_add: undefined,
    can_delete: undefined,
    can_update: undefined,
  };
}

export function buildEmptyTableSettingsWithEmptyWidgets(
  connectionId: string,
  tableName: string,
  userId: string,
): CreateTableSettingsDs {
  return {
    autocomplete_columns: undefined,
    columns_view: undefined,
    connection_id: connectionId,
    custom_fields: undefined,
    display_name: undefined,
    excluded_fields: undefined,
    identification_fields: undefined,
    identity_column: undefined,
    list_fields: undefined,
    list_per_page: undefined,
    masterPwd: undefined,
    ordering: undefined,
    ordering_field: undefined,
    readonly_fields: undefined,
    search_fields: undefined,
    sortable_by: undefined,
    table_name: tableName,
    table_widgets: [],
    table_actions: [],
    userId: userId,
    can_add: undefined,
    can_delete: undefined,
    can_update: undefined,
  };
}
