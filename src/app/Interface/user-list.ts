
export interface Response {
    page: number;
    pageSize: number;
    count: number;
    total: number;
    pagesCount: number;
    data: User[];
}

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    streak: number;
    maxStreak?: number;
    avatar: string;
    lastSeen: string;
    contests?: number;
    contestsIcon?: string;
    contestsSeverity?: 'info' | 'success' | 'warning' | 'danger';
    challenges?: number;
    challengesRank?: 'R2' | 'R3' | 'R4' | 'R5';
    challengesSeverity?: 'info' | 'success' | 'warning' | 'danger';
    kepcoin: number;
    skillsRating: string;
    activityRating: string;
}

export interface TablePageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

