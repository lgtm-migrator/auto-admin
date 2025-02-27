export interface TablePermissions {
    visibility: boolean,
    readonly: boolean,
    add: boolean,
    delete: boolean,
    edit: boolean
}

export interface TableProperties {
    table: string,
    display_name?: string,
    normalizedTableName?: string,
    permissions: TablePermissions,
}

export enum TableOrdering {
    Ascending = 'ASC',
    Descending = 'DESC'
}

export interface TableSettings {
    // id: string,
    connection_id: string,
    table_name: string,
    display_name: string,
    autocomplete_columns: string[],
    identity_column: string,
    search_fields: string[],
    excluded_fields: string[],
    list_fields: string[],
    ordering: TableOrdering,
    ordering_field: string,
    readonly_fields: string[],
    sortable_by: string[],
    columns_view: string[]
}

export interface TableField {
    column_name: string,
    column_default: string,
    data_type: string,
    data_type_params?: string[],
    isExcluded: boolean,
    isSearched: boolean,
    allow_null: boolean,
    auto_increment: boolean,
    character_maximum_length: number
}

export interface TableForeignKey {
    autocomplete_columns?: string[],
    column_name: string,
    constraint_name: string,
    referenced_column_name: string,
    referenced_table_name: string,
    column_default?: string,
}

export interface Widget {
    field_name: string,
    widget_type: string,
    widget_params: any,
    name: string,
    description: string
}