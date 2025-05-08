import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transactions.dto';
import { FilterTransactionDto } from './dtos/filter-transaction.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam} from '@nestjs/swagger';
import { TransactionDto } from './dtos/transaction-dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}


  @Get('summary')
  @ApiOperation({ summary: 'получить сводку по транзакциям текущего пользователя' })
  @ApiResponse({ status: 200, description: 'сводка успешна получена, '})
  getSummary(@Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.getSummary(userId);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Фильтрация транзакций по параметрам' })
  @ApiQuery({ name: 'type', required: false, enum: ['income','expense'], description: 'Тип транзакции' })
  @ApiQuery({ name: 'category', required: false, description: 'Категория' })
  @ApiQuery({ name: 'from', required: false, description: 'Дата от (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to',   required: false, description: 'Дата до (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Список отфильтрованных транзакций', type: TransactionDto, isArray: true })
  filter(
    @Query() query: FilterTransactionDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.transactionsService.filterTransactions(userId,query)
  } 

  @Get()
  @ApiOperation({ summary: 'Получить все транзакции текущего пользователя' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы'})
  @ApiQuery({ name: 'limit', required: false, description: 'Количество элементов'})
  findAllByUser(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.userid;
    return this.transactionsService.findAllByUser(userId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по id' })
  @ApiParam({ name: 'id', description: 'ID транзакции', type: Number })
  @ApiResponse({ status: 200, description: 'Данные транзакции', type: TransactionDto })
  @ApiResponse({ status: 400, description: 'Транзакция не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.findOne(id, userId);
  }

  @Post('create')
  @ApiOperation({ summary: 'создать транзакцию' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'транзакция успешно создана', type: TransactionDto })
  createTransaction(@Body() dto: CreateTransactionDto, @Req() req: any){
    const userId = req.user.userId; 
    return this.transactionsService.create(dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить транзакцию по ID' })
  @ApiParam({ name: 'id', description: 'ID транзакции', type: Number })
  @ApiResponse({ status: 200, description: 'Транзакция удалена', type: TransactionDto })
  @ApiResponse({ status: 400, description: 'Транзакция не существует' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.remove(id, userId);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiParam({ name: 'id', description: 'ID транзакции', type: Number })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена', type: TransactionDto })
  @ApiResponse({ status: 400, description: 'Транзакция не найдена' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
    @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.update(id, dto, userId);
  }
   
}
