import { getDatabase } from './setupDatabase';

export type BodyweightExerciseType =
  | 'hang'
  | 'pushup'
  | 'handstand_pushup'
  | 'stairs'
  | 'running';

export interface BodyweightWorkoutEntry {
  id: number;
  date: string;
  exercise_type: BodyweightExerciseType;
  set_index: number;
  duration_seconds: number | null;
  reps: number | null;
  floors: number | null;
  distance_km: number | null;
  time_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface BodyweightSetInput {
  setIndex: number;
  durationSeconds?: number | null;
  reps?: number | null;
  floors?: number | null;
  distanceKm?: number | null;
  timeSeconds?: number | null;
}

export async function getBodyweightEntriesByDate(
  date: string
): Promise<BodyweightWorkoutEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<BodyweightWorkoutEntry>(
    `SELECT id, date, exercise_type, set_index, duration_seconds, reps, floors, distance_km, time_seconds, created_at, updated_at
     FROM bodyweight_workout_entries
     WHERE date = ?
     ORDER BY 
       CASE exercise_type
         WHEN 'stairs' THEN 1
         WHEN 'pushup' THEN 2
         WHEN 'handstand_pushup' THEN 3
         WHEN 'hang' THEN 4
         WHEN 'running' THEN 5
         ELSE 6
       END,
       set_index ASC`,
    [date]
  );
}

export async function replaceBodyweightExerciseEntries(
  date: string,
  exerciseType: BodyweightExerciseType,
  sets: BodyweightSetInput[]
): Promise<void> {
  const db = await getDatabase();

  // 트랜잭션 처리
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM bodyweight_workout_entries WHERE date = ? AND exercise_type = ?`,
      [date, exerciseType]
    );

    for (const set of sets) {
      await db.runAsync(
        `INSERT INTO bodyweight_workout_entries
          (date, exercise_type, set_index, duration_seconds, reps, floors, distance_km, time_seconds, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          date,
          exerciseType,
          set.setIndex,
          set.durationSeconds ?? null,
          set.reps ?? null,
          set.floors ?? null,
          set.distanceKm ?? null,
          set.timeSeconds ?? null,
        ]
      );
    }
  });
}

export async function deleteBodyweightExerciseEntries(
  date: string,
  exerciseType: BodyweightExerciseType
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM bodyweight_workout_entries WHERE date = ? AND exercise_type = ?`,
    [date, exerciseType]
  );
}

export interface BodyweightHistoryEntry {
  date: string;
  sets: {
    setIndex: number;
    durationSeconds: number | null;
    reps: number | null;
    floors: number | null;
    distanceKm: number | null;
    timeSeconds: number | null;
  }[];
}

export async function getBodyweightHistory(
  exerciseType: BodyweightExerciseType,
  limit: number,
  offset: number
): Promise<BodyweightHistoryEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BodyweightWorkoutEntry>(
    `SELECT id, date, exercise_type, set_index, duration_seconds, reps, floors, distance_km, time_seconds, created_at, updated_at
     FROM bodyweight_workout_entries
     WHERE exercise_type = ?
     ORDER BY date DESC, set_index ASC
     LIMIT ? OFFSET ?`,
    [exerciseType, limit, offset]
  );

  const grouped = new Map<string, BodyweightHistoryEntry>();

  for (const row of rows) {
    if (!grouped.has(row.date)) {
      grouped.set(row.date, {
        date: row.date,
        sets: [],
      });
    }
    grouped.get(row.date)!.sets.push({
      setIndex: row.set_index,
      durationSeconds: row.duration_seconds,
      reps: row.reps,
      floors: row.floors,
      distanceKm: row.distance_km,
      timeSeconds: row.time_seconds,
    });
  }

  return Array.from(grouped.values());
}

export async function getLatestBodyweightHistory(
  exerciseType: BodyweightExerciseType
): Promise<BodyweightHistoryEntry | null> {
  const histories = await getBodyweightHistory(exerciseType, 1, 0);
  return histories.length > 0 ? histories[0] : null;
}

export async function getMaxBodyweightValue(
  exerciseType: BodyweightExerciseType
): Promise<number | null> {
  const db = await getDatabase();

  if (exerciseType === 'hang') {
    const result = await db.getFirstAsync<{ max_value: number | null }>(
      `SELECT MAX(duration_seconds) as max_value
       FROM bodyweight_workout_entries
       WHERE exercise_type = ? AND duration_seconds IS NOT NULL`,
      [exerciseType]
    );
    return result?.max_value ?? null;
  } else if (exerciseType === 'stairs') {
    const result = await db.getFirstAsync<{ max_value: number | null }>(
      `SELECT MAX(floors) as max_value
       FROM bodyweight_workout_entries
       WHERE exercise_type = ? AND floors IS NOT NULL`,
      [exerciseType]
    );
    return result?.max_value ?? null;
  } else if (exerciseType === 'running') {
    const result = await db.getFirstAsync<{ max_value: number | null }>(
      `SELECT MAX(distance_km) as max_value
       FROM bodyweight_workout_entries
       WHERE exercise_type = ? AND distance_km IS NOT NULL`,
      [exerciseType]
    );
    return result?.max_value ?? null;
  } else {
    // pushup, handstand_pushup
    const result = await db.getFirstAsync<{ max_value: number | null }>(
      `SELECT MAX(reps) as max_value
       FROM bodyweight_workout_entries
       WHERE exercise_type = ? AND reps IS NOT NULL`,
      [exerciseType]
    );
    return result?.max_value ?? null;
  }
}
