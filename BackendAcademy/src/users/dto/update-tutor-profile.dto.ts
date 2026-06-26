import { TutorSpecialty } from '../interfaces/tutor-specialty.enum';

export class UpdateTutorProfileDto {
  bio?: string;
  specialties?: TutorSpecialty[];
  hourlyRate?: number;
  availability?: boolean;
  isVerified?: boolean;
}
