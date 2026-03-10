// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ENotificationType {
  Like    = 'like',
  Follow  = 'follow',
  Comment = 'comment',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IReel {
  id: string;
  videoUrl: string;
  caption: string;
  username: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  userId: string;
}

export interface INotification {
  id: string;
  type: ENotificationType;
  text: string;
  time: string;
}

export interface IUserResult {
  uid: string;
  username: string;
  displayName: string;
  followersCount: number;
}

export interface ISearchCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface IIconConfig {
  name: any;
  color: string;
}

// ─── Dummy Reels ─────────────────────────────────────────────────────────────

export const DUMMY_REELS: IReel[] = [
  {
    id: '1',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    caption: 'First reel on EarnInsta! 🎬🔥 #viral #fyp',
    username: 'earninsta_official',
    likesCount: 12400,
    commentsCount: 450,
    sharesCount: 230,
    userId: 'demo1',
  },
  {
    id: '2',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    caption: 'Watch and earn coins! 💰 #earn #money',
    username: 'creator_pro',
    likesCount: 8900,
    commentsCount: 320,
    sharesCount: 150,
    userId: 'demo2',
  },
];

// ─── Dummy Notifications ─────────────────────────────────────────────────────

export const DEMO_NOTIFICATIONS: INotification[] = [
  { id: '1', type: ENotificationType.Like,    text: 'earninsta_official liked your reel',  time: '2m ago'  },
  { id: '2', type: ENotificationType.Follow,  text: 'creator_pro started following you',   time: '10m ago' },
  { id: '3', type: ENotificationType.Comment, text: 'user123 commented: "Amazing video!"', time: '1h ago'  },
  { id: '4', type: ENotificationType.Like,    text: '5 people liked your reel',             time: '2h ago'  },
];

// ─── Notification Icon Map ────────────────────────────────────────────────────

export const NOTIFICATION_ICON_MAP: Record<ENotificationType, IIconConfig> = {
  [ENotificationType.Like]:    { name: 'heart',       color: '#E91E8C' },
  [ENotificationType.Follow]:  { name: 'person-add',  color: '#4CAF50' },
  [ENotificationType.Comment]: { name: 'chatbubble',  color: '#2196F3' },
};

// ─── Search Categories ────────────────────────────────────────────────────────

export const SEARCH_CATEGORIES: ISearchCategory[] = [
  { id: '1', label: 'Trending Creators', icon: 'flame',    color: '#FF6B35' },
  { id: '2', label: 'New Users',         icon: 'sparkles', color: '#9B59B6' },
  { id: '3', label: 'Top Earners',       icon: 'trophy',   color: '#F1C40F' },
];
