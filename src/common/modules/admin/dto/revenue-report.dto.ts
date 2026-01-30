import { IsDateString, IsIn } from 'class-validator';

export class RevenueReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsIn(['daily', 'monthly'])
  interval: 'daily' | 'monthly';
}
