import { Controller, Get, Inject, Injectable, Res, Scope, UseInterceptors } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UseCaseType } from '../../common/data-injection.tokens';
import { InTransactionEnum } from '../../enums';
import { SentryInterceptor } from '../../interceptors';
import { IGetConversions } from './use-cases/get-conversions-use-cases.interface';

@ApiBasicAuth()
@ApiTags('conversions')
@UseInterceptors(SentryInterceptor)
@Controller()
@Injectable()
export class ConversionController {
  constructor(
    @Inject(UseCaseType.GET_CONVERSIONS)
    private readonly getConversionsUseCase: IGetConversions,
  ) {}

  @ApiOperation({ summary: 'Get conversions' })
  @ApiResponse({ status: 200, description: 'Return conversions in CSV format.' })
  @Get('/conversions')
  async getConversions(@Res() res: Response): Promise<any> {
    const csvData = await this.getConversionsUseCase.execute(undefined, InTransactionEnum.OFF);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=conversions.csv');
    res.status(200).end(csvData);
    return;
  }
}
