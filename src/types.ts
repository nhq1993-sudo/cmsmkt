
export enum AdPlatform {
  FACEBOOK = 'Facebook',
  GOOGLE = 'Google',
  TIKTOK = 'TikTok'
}

export enum AdStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Ad {
  id: string;
  account: string;
  platform: AdPlatform;
  adObjective?: string;     // Hình thức chạy quảng cáo
  serviceCategory: string; // Dịch vụ (Vietlott, Vay nhanh, etc.)
  partnerBank?: string;    // Ngân hàng (Vietcombank, BIDV, etc.)
  campaignName: string;
  campaignLink?: string;   // Link trực tiếp đến chiến dịch
  adGroupName: string;
  adGroupLink?: string;    // Link trực tiếp đến nhóm quảng cáo
  adName: string;
  adLink?: string;         // Link trực tiếp đến mẫu quảng cáo
  status: AdStatus;
  startDate: string;
  endDate: string;
  budget: number;
  budgetType: 'Hàng ngày' | 'Trọn đời';
  placementOptimization: string; // Tối ưu Vị trí hiển thị
  targetAudience: {
    age: string;
    interests: string[];
    locations: string[];
    detailedTargeting?: string; // Target chi tiết
  };
  fanpage: {
    name: string;
    avatar: string;
  };
  content: {
    caption: string;
    headline: string;
    cta: string;
    destinationUrl: string;
    deeplink?: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    previewLink?: string; // Link Preview Ads (e.g., https://fb.me/adspreview/...)
  };
  assetTimeline: string; // Timeline tư liệu
  assetSource: string;   // Nguồn tư liệu
  otherIssues?: string;  // Vấn đề khác?
  lastUpdated: string;
  createdAt: string;     // Ngày tạo mẫu quảng cáo
  version: number;
  owner: string;
  ownerEmail?: string;
  checklist: {
    brandVoice: boolean;
    policyCheck: boolean;
    linkCheck: boolean;
    guidelineCheck: boolean;
    ctaCheck: boolean;
  };
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  field?: string; // Định danh trường bị lỗi (VD: 'content.headline')
  timestamp: string;
  resolved: boolean;
}

export interface TimelineEntry {
  id: string;
  adId: string;
  action: string;
  user: string;
  timestamp: string;
  note?: string;
  mediaSource?: string;
}
