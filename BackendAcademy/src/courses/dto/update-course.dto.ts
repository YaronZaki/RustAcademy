import { CourseLevel } from '../interfaces/course-level.enum';

export class UpdateCourseDto {
  title?: string;
  description?: string;
  level?: CourseLevel;
  order?: number;
  learningPathId?: string;
  duration?: number;
  prerequisites?: string[];
  skills?: string[];
  xpReward?: number;
  isActive?: boolean;
}
