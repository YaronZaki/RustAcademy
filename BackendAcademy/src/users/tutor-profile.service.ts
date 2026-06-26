import { Injectable, NotFoundException } from '@nestjs/common';
import { TutorProfileEntity } from './tutor-profile.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { RateTutorDto } from './dto/rate-tutor.dto';

@Injectable()
export class TutorProfileService {
  private readonly profiles: Map<string, TutorProfileEntity> = new Map();

  async create(dto: CreateTutorProfileDto): Promise<TutorProfileEntity> {
    const profile = new TutorProfileEntity({
      id: crypto.randomUUID(),
      ...dto,
    });
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async findAll(): Promise<TutorProfileEntity[]> {
    return Array.from(this.profiles.values());
  }

  async findById(id: string): Promise<TutorProfileEntity | null> {
    return this.profiles.get(id) || null;
  }

  async findByUserId(userId: string): Promise<TutorProfileEntity | null> {
    return (
      Array.from(this.profiles.values()).find(p => p.userId === userId) || null
    );
  }

  async findBySpecialty(specialty: string): Promise<TutorProfileEntity[]> {
    return Array.from(this.profiles.values()).filter(p =>
      p.specialties.includes(specialty as any),
    );
  }

  async update(
    id: string,
    dto: UpdateTutorProfileDto,
  ): Promise<TutorProfileEntity | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;
    Object.assign(profile, dto, { updatedAt: new Date() });
    return profile;
  }

  async rate(id: string, dto: RateTutorDto): Promise<TutorProfileEntity> {
    const profile = this.profiles.get(id);
    if (!profile) throw new NotFoundException('Tutor profile not found');
    const total = profile.totalRatings * profile.averageRating + dto.rating;
    profile.totalRatings += 1;
    profile.averageRating = total / profile.totalRatings;
    profile.updatedAt = new Date();
    return profile;
  }

  async incrementCoursesCreated(id: string): Promise<void> {
    const profile = this.profiles.get(id);
    if (profile) {
      profile.coursesCreated += 1;
      profile.updatedAt = new Date();
    }
  }

  async updateEarnings(id: string, amount: number): Promise<void> {
    const profile = this.profiles.get(id);
    if (profile) {
      profile.totalEarnings += amount;
      profile.updatedAt = new Date();
    }
  }

  async remove(id: string): Promise<boolean> {
    return this.profiles.delete(id);
  }
}
