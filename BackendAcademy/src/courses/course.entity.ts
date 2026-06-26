import { CourseLevel } from './interfaces/course-level.enum';

export class CourseEntity {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  order: number;
  learningPathId: string;
  duration: number;
  prerequisites: string[];
  skills: string[];
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CourseEntity>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
    this.isActive = this.isActive ?? true;
    this.prerequisites = this.prerequisites || [];
    this.skills = this.skills || [];
  }
}
