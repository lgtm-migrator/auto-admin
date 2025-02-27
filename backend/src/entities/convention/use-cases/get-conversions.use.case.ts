import { Inject, Injectable, Scope } from '@nestjs/common';
import AbstractUseCase from '../../../common/abstract-use.case';
import { IGetConversions } from './get-conversions-use-cases.interface';
import { BaseType } from '../../../common/data-injection.tokens';
import { IGlobalDatabaseContext } from '../../../common/application/global-database-context.intarface';
import { Parser as CsvParser } from 'json2csv';

@Injectable()
export class GetConversionsUseCase extends AbstractUseCase<void, string> implements IGetConversions {
  constructor(
    @Inject(BaseType.GLOBAL_DB_CONTEXT)
    protected _dbContext: IGlobalDatabaseContext,
  ) {
    super();
  }

  protected async implementation(): Promise<string> {
    const freshUsers = await this._dbContext.userRepository.getUsersWithNotNullGCLIDsInTwoWeeks();
    const workedFreshConnections = await this._dbContext.connectionRepository.getWorkedConnectionsInTwoWeeks();

    const conversionsArray = [];

    for (const user of freshUsers) {
      conversionsArray.push({
        ['Google Click ID']: user.gclid,
        ['Conversion Name']: 'Registration',
        ['Conversion Time']: user.createdAt,
      });
    }

    for (const connection of workedFreshConnections) {
      conversionsArray.push({
        ['Google Click ID']: connection.author.gclid,
        ['Conversion Name']: 'Connection added',
        ['Conversion Time']: connection.createdAt,
      });
    }

    const fields = ['Google Click ID', 'Conversion Name', 'Conversion Time'];
    const head = 'Parameters:TimeZone=-0500' + '\r\n';
    const csvParser = new CsvParser({ fields });
    const csvData: string = csvParser.parse(conversionsArray);
    return head + csvData;
  }
}
