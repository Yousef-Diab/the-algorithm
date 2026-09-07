export interface ExamResultDto {
  best: number;
  last: number;
  taken: number;
  submitted: boolean;
  picks: Record<string, string>;
}
