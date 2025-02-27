import { Controller, Get, HttpStatus, Inject, Injectable, Query, UseInterceptors } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseCaseType } from '../../common/data-injection.tokens';
import { SlugUuid, UserId } from '../../decorators';
import { InTransactionEnum } from '../../enums';
import { Messages } from '../../exceptions/text/messages';
import { SentryInterceptor } from '../../interceptors';
import { FindLogsDs } from './application/data-structures/find-logs.ds';
import { FoundLogsDs } from './application/data-structures/found-logs.ds';
import { IFindLogs } from './use-cases/use-cases.interface';

@ApiBearerAuth()
@ApiTags('logs')
@UseInterceptors(SentryInterceptor)
@Controller()
@Injectable()
export class TableLogsController {
  constructor(
    @Inject(UseCaseType.FIND_LOGS)
    private readonly findLogsUseCase: IFindLogs,
  ) {}

  @ApiOperation({
    summary: `Get all connection logs.
  In query you can pass:
  tableName=value |
  order=ASC (sorting by time when  record was created at) |
  page=value &
  perPage=value |
  dateFrom=value &
  dateTo=value (to get logs between two dates) |
  email=value |
  limit=value (if you do not want use pagination. default limit is 500)
  `,
  })
  @ApiResponse({ status: 200, description: 'Return all table logs.' })
  @Get('/logs/:slug')
  async findAll(@Query() query, @SlugUuid() connectionId: string, @UserId() userId: string): Promise<FoundLogsDs> {
    if (!connectionId) {
      throw new HttpException(
        {
          message: Messages.PARAMETER_MISSING,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const inputData: FindLogsDs = {
      connectionId: connectionId,
      query: query,
      userId: userId,
    };
    return await this.findLogsUseCase.execute(inputData, InTransactionEnum.OFF);
  }
}
