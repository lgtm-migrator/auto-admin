import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Injectable,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseCaseType } from '../../common/data-injection.tokens';
import { MasterPassword, QueryTableName, QueryUuid, UserId } from '../../decorators';
import { InTransactionEnum, QueryOrderingEnum } from '../../enums';
import { Messages } from '../../exceptions/text/messages';
import { ConnectionEditGuard, ConnectionReadGuard } from '../../guards';
import { toPrettyErrorsMsg } from '../../helpers';
import { SentryInterceptor } from '../../interceptors';
import { CustomFieldsEntity } from '../custom-field/custom-fields.entity';
import { CreateTableSettingsDs } from './application/data-structures/create-table-settings.ds';
import { DeleteTableSettingsDs } from './application/data-structures/delete-table-settings.ds';
import { FindTableSettingsDs } from './application/data-structures/find-table-settings.ds';
import { FoundTableSettingsDs } from './application/data-structures/found-table-settings.ds';
import { CreateTableSettingsDto } from './dto';
import {
  ICreateTableSettings,
  IDeleteTableSettings,
  IFindTableSettings,
  IUpdateTableSettings,
} from './use-cases/use-cases.interface';

@ApiBearerAuth()
@ApiTags('settings')
@UseInterceptors(SentryInterceptor)
@Controller()
@Injectable()
export class TableSettingsController {
  constructor(
    @Inject(UseCaseType.FIND_TABLE_SETTINGS)
    private readonly findTableSettingsUseCase: IFindTableSettings,
    @Inject(UseCaseType.CREATE_TABLE_SETTINGS)
    private readonly createTableSettingsUseCase: ICreateTableSettings,
    @Inject(UseCaseType.UPDATE_TABLE_SETTINGS)
    private readonly updateTableSettingsUseCase: IUpdateTableSettings,
    @Inject(UseCaseType.DELETE_TABLE_SETTINGS)
    private readonly deleteTableSettingsUseCase: IDeleteTableSettings,
  ) {}

  @ApiOperation({ summary: 'Get all table settings in this connection' })
  @ApiResponse({ status: 200, description: 'Return all table settings.' })
  @UseGuards(ConnectionReadGuard)
  @Get('/settings/')
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @QueryUuid('connectionId') connectionId: string,
    @QueryTableName() tableName: string,
  ): Promise<FoundTableSettingsDs> {
    if (!connectionId) {
      throw new HttpException(
        {
          message: Messages.CONNECTION_ID_MISSING,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const inputData: FindTableSettingsDs = {
      connectionId: connectionId,
      tableName: tableName,
    };
    return await this.findTableSettingsUseCase.execute(inputData, InTransactionEnum.OFF);
  }

  @ApiOperation({ summary: 'Create table settings' })
  @ApiBody({ type: CreateTableSettingsDto })
  @ApiResponse({ status: 201, description: 'The settings was successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(ConnectionEditGuard)
  @Post('/settings/')
  async createSettings(
    @QueryUuid('connectionId') connectionId: string,
    @QueryTableName() tableName: string,
    /* eslint-disable */
    @Body('search_fields') search_fields: Array<string>,
    @Body('display_name') display_name: string,
    @Body('excluded_fields') excluded_fields: Array<string>,
    @Body('list_fields') list_fields: Array<string>,
    @Body('identification_fields') identification_fields: Array<string>,
    @Body('list_per_page') list_per_page: number,
    @Body('ordering') ordering: QueryOrderingEnum,
    @Body('ordering_field') ordering_field: string,
    @Body('readonly_fields') readonly_fields: Array<string>,
    @Body('sortable_by') sortable_by: Array<string>,
    @Body('autocomplete_columns') autocomplete_columns: Array<string>,
    @Body('customFields') customFields: Array<CustomFieldsEntity>,
    @Body('columns_view') columns_view: Array<string>,
    @Body('identity_column') identity_column: string,
    @Body('can_delete') can_delete: boolean,
    @Body('can_update') can_update: boolean,
    @Body('can_add') can_add: boolean,
    @UserId() userId: string,
    @MasterPassword() masterPwd: string,
  ): Promise<FoundTableSettingsDs> {
    const inputData: CreateTableSettingsDs = {
      table_name: tableName,
      display_name: display_name,
      connection_id: connectionId,
      search_fields: search_fields,
      excluded_fields: excluded_fields,
      list_fields: list_fields,
      list_per_page: list_per_page,
      ordering: ordering,
      ordering_field: ordering_field,
      readonly_fields: readonly_fields,
      sortable_by: sortable_by,
      autocomplete_columns: autocomplete_columns,
      custom_fields: customFields,
      identification_fields: identification_fields,
      columns_view: columns_view,
      identity_column: identity_column,
      masterPwd: masterPwd,
      userId: userId,
      table_widgets: undefined,
      can_delete: can_delete,
      can_update: can_update,
      can_add: can_add,
    };
    /* eslint-enable */
    const errors = this.validateParameters(inputData);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: toPrettyErrorsMsg(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.createTableSettingsUseCase.execute(inputData, InTransactionEnum.ON);
  }

  @ApiOperation({ summary: 'Update table settings' })
  @ApiBody({ type: CreateTableSettingsDto })
  @ApiResponse({ status: 201, description: 'The settings was successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(ConnectionEditGuard)
  @Put('/settings/')
  async updateSettings(
    @QueryUuid('connectionId') connectionId: string,
    @QueryTableName() tableName: string,
    /* eslint-disable */
    @Body('search_fields') search_fields: Array<string>,
    @Body('display_name') display_name: string,
    @Body('excluded_fields') excluded_fields: Array<string>,
    @Body('list_fields') list_fields: Array<string>,
    @Body('identification_fields') identification_fields: Array<string>,
    @Body('list_per_page') list_per_page: number,
    @Body('ordering') ordering: QueryOrderingEnum,
    @Body('ordering_field') ordering_field: string,
    @Body('readonly_fields') readonly_fields: Array<string>,
    @Body('sortable_by') sortable_by: Array<string>,
    @Body('autocomplete_columns') autocomplete_columns: Array<string>,
    @Body('customFields') customFields: Array<CustomFieldsEntity>,
    @Body('columns_view') columns_view: Array<string>,
    @Body('identity_column') identity_column: string,
    @Body('can_delete') can_delete: boolean,
    @Body('can_update') can_update: boolean,
    @Body('can_add') can_add: boolean,
    @UserId() userId: string,
    @MasterPassword() masterPwd: string,
  ): Promise<FoundTableSettingsDs> {
    const inputData: CreateTableSettingsDs = {
      autocomplete_columns: autocomplete_columns,
      columns_view: columns_view,
      connection_id: connectionId,
      custom_fields: customFields,
      display_name: display_name,
      excluded_fields: excluded_fields,
      identification_fields: identification_fields,
      identity_column: identity_column,
      list_fields: list_fields,
      list_per_page: list_per_page,
      masterPwd: masterPwd,
      ordering: ordering,
      ordering_field: ordering_field,
      readonly_fields: readonly_fields,
      search_fields: search_fields,
      sortable_by: sortable_by,
      table_name: tableName,
      userId: userId,
      can_delete: can_delete,
      can_update: can_update,
      can_add: can_add,
    };
    /* eslint-enable */
    const errors = this.validateParameters(inputData);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: toPrettyErrorsMsg(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.updateTableSettingsUseCase.execute(inputData, InTransactionEnum.ON);
  }

  @ApiOperation({ summary: 'Delete table settings' })
  @ApiResponse({ status: 201, description: 'The settings was successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(ConnectionEditGuard)
  @Delete('/settings/')
  async deleteSettings(
    @QueryUuid('connectionId') connectionId: string,
    @QueryTableName() tableName: string,
  ): Promise<FoundTableSettingsDs> {
    if (!connectionId) {
      throw new HttpException(
        {
          message: Messages.PARAMETER_MISSING,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const inputData: DeleteTableSettingsDs = {
      connectionId: connectionId,
      tableName: tableName,
    };
    return await this.deleteTableSettingsUseCase.execute(inputData, InTransactionEnum.ON);
  }

  private validateParameters(tableSettingsDTO: CreateTableSettingsDto): Array<string> {
    const errors = [];
    if (!tableSettingsDTO.table_name) {
      errors.push(Messages.TABLE_NAME_MISSING);
    }
    if (!tableSettingsDTO.connection_id) {
      errors.push(Messages.CONNECTION_ID_MISSING);
    }
    return errors;
  }
}
