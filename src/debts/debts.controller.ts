import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { buildResponse } from 'src/common/helper/build-response.helper';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDebtDto: CreateDebtDto, @GetUser() user: User, @Req() req: Request) {
    const result = await this.debtsService.create(createDebtDto, user.id);
    return buildResponse(result, req.url, 'Debt created successfully', HttpStatus.CREATED);
  }

  @UseGuards(JwtAuthGuard)
  @Get('home/:homeId')
  async getAllByHome(@Param('homeId') homeId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.debtsService.getAllByHome(+homeId, user.id);
    return buildResponse(result, req.url, 'Debts retrieved successfully', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('pay/:debtMemberId')
  async payDebtMember(
    @Param('debtMemberId') debtMemberId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.debtsService.payDebtMember(+debtMemberId, user.id);
    return buildResponse(result, req.url, 'Debt member paid successfully', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':debtId')
  async deleteDebt(@Param('debtId') debtId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.debtsService.deleteDebt(+debtId, user.id);
    return buildResponse(result, req.url, 'Debt deleted paid successfully', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:houseId/summary')
  async summaryDebt(@Param('houseId') houseId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.debtsService.summary(+houseId, user.id);
    return buildResponse(result, req.url, 'Debt summary found successfully');
  }

  @Get()
  findAll() {
    return this.debtsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtsService.update(+id, updateDebtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtsService.remove(+id);
  }
}
