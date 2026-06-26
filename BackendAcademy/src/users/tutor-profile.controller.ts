import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TutorProfileService } from './tutor-profile.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { RateTutorDto } from './dto/rate-tutor.dto';

@Controller('tutors')
export class TutorProfileController {
  constructor(private readonly tutorService: TutorProfileService) {}

  @Post()
  async create(@Body() dto: CreateTutorProfileDto) {
    return this.tutorService.create(dto);
  }

  @Get()
  async findAll() {
    return this.tutorService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.tutorService.findByUserId(userId);
  }

  @Get('specialty/:specialty')
  async findBySpecialty(@Param('specialty') specialty: string) {
    return this.tutorService.findBySpecialty(specialty);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTutorProfileDto,
  ) {
    return this.tutorService.update(id, dto);
  }

  @Post(':id/rate')
  async rate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RateTutorDto,
  ) {
    return this.tutorService.rate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorService.remove(id);
  }
}
