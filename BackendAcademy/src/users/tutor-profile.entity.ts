import { TutorSpecialty } from './interfaces/tutor-specialty.enum';

export class TutorProfileEntity {
  id: string;
  userId: string;
  bio: string;
  specialties: TutorSpecialty[];
  reputationScore: number;
  totalRatings: number;
  averageRating: number;
  coursesCreated: number;
  totalEarnings: number;
  isVerified: boolean;
  availability: boolean;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TutorProfileEntity>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
    this.isVerified = this.isVerified ?? false;
    this.availability = this.availability ?? true;
    this.reputationScore = this.reputationScore || 0;
    this.totalRatings = this.totalRatings || 0;
    this.averageRating = this.averageRating || 0;
    this.coursesCreated = this.coursesCreated || 0;
    this.totalEarnings = this.totalEarnings || 0;
    this.specialties = this.specialties || [];
    this.hourlyRate = this.hourlyRate || 0;
  }
}
