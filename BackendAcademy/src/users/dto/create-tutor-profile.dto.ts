import { TutorSpecialty } from '../interfaces/tutor-specialty.enum';

export class CreateTutorProfileDto {
  userId: string;
  bio: string;
  specialties: TutorSpecialty[];
  hourlyRate?: number;
  availability?: boolean;
}
