export interface MorningRoutineGoals {
  id: number;
  year: number;
  reading_initial_minutes: number | null;
  reading_increment_minutes: number | null;
  stairs_initial_floors: number | null;
  stairs_increment_floors: number | null;
  stairs_max_floors: number | null;
  pushup_initial_count: number | null;
  pushup_increment_count: number | null;
  pushup_max_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface HabitYoutubeVideo {
  id: number;
  habit_type: 'reading' | 'stairs' | 'pushup';
  video_id: string;
  video_url: string;
  is_shorts: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadingRecord {
  id: number;
  date: string;
  book_name: string | null;
  page_start: number | null;
  page_end: number | null;
  summary: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface StairsRecord {
  id: number;
  date: string;
  week_number: number;
  target_floors: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  steps_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface PushupRecord {
  id: number;
  date: string;
  week_number: number;
  target_count: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface DateRecord {
  reading: boolean;
  stairs: boolean;
  pushup: boolean;
}
