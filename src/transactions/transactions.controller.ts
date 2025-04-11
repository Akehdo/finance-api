import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transactions.dto';
import { FilterTransactionDto } from './dtos/filter-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}


  @Get('summary')
  getSummary(@Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.getSummary(userId);
  }

  @Get('filter')
  filter(
    @Query() query: FilterTransactionDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.transactionsService.filterTransactions(userId,query)
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId', ParseIntPipe) userId: number){
    return this.transactionsService.findAllByUser(userId);
  } 

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.findOne(id, userId);
  }

  @Post('create')
  createTransaction(@Body() dto: CreateTransactionDto, @Req() req: any){
    const userId = req.user.userId; 
    return this.transactionsService.create(dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.remove(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
    @Req() req: any) {
    const userId = req.user.userId;
    return this.transactionsService.update(id, dto, userId);
  }



   
}
