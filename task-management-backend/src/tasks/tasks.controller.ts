import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user);
  }
}
