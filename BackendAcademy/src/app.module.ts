import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TutorProfileModule } from './users/tutor-profile.module';

@Module({
  imports: [TutorProfileModule],


@Module({
  imports: [CourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
