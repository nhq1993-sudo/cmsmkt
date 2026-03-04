
import { Ad, AdStatus, AdPlatform } from '@/types';

export const MOCK_ADS: Ad[] = [
  {
    id: 'mock-1',
    account: 'VNPAY_OFFICIAL',
    platform: AdPlatform.FACEBOOK,
    adObjective: 'Traffic',
    serviceCategory: 'VNPAY-QR',
    partnerBank: 'Vietcombank',
    campaignName: 'Summer Promotion 2024',
    adGroupName: 'Gen Z Audience',
    adName: 'VNPAY-QR Summer Deal',
    status: AdStatus.APPROVED,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    budget: 50000000,
    budgetType: 'Trọn đời',
    placementOptimization: 'Automatic',
    targetAudience: {
      age: '18-35',
      interests: ['Shopping', 'Travel'],
      locations: ['Hanoi', 'HCM City']
    },
    fanpage: {
      name: 'VNPAY',
      avatar: 'https://picsum.photos/seed/vnpay/100/100'
    },
    content: {
      caption: 'Get 50k off your first VNPAY-QR transaction this summer!',
      headline: 'Summer Vibes with VNPAY',
      cta: 'Learn More',
      destinationUrl: 'https://vnpay.vn',
      mediaUrl: 'https://picsum.photos/seed/vnpay1/800/600',
      mediaType: 'image'
    },
    assetTimeline: 'Q2 2024',
    assetSource: 'Internal Creative Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    version: 1,
    owner: 'admin',
    checklist: {
      brandVoice: true,
      policyCheck: true,
      linkCheck: true,
      guidelineCheck: true,
      ctaCheck: true
    },
    comments: []
  },
  {
    id: 'mock-2',
    account: 'ZALOPAY_ADS',
    platform: AdPlatform.TIKTOK,
    adObjective: 'Video Views',
    serviceCategory: 'ZaloPay Wallet',
    campaignName: 'Cashback Frenzy',
    adGroupName: 'Tech Enthusiasts',
    adName: 'ZaloPay Cashback 10%',
    status: AdStatus.PENDING,
    startDate: '2024-07-01',
    endDate: '2024-07-15',
    budget: 1000000,
    budgetType: 'Hàng ngày',
    placementOptimization: 'In-feed',
    targetAudience: {
      age: '20-45',
      interests: ['Fintech', 'Gadgets'],
      locations: ['Vietnam']
    },
    fanpage: {
      name: 'ZaloPay',
      avatar: 'https://picsum.photos/seed/zalo/100/100'
    },
    content: {
      caption: 'Scan and pay with ZaloPay to get 10% cashback instantly.',
      headline: 'Pay Faster, Save More',
      cta: 'Install Now',
      destinationUrl: 'https://zalopay.vn',
      mediaUrl: 'https://picsum.photos/seed/zalopay/800/600',
      mediaType: 'image'
    },
    assetTimeline: 'Q3 2024',
    assetSource: 'Agency X',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    version: 1,
    owner: 'marketing_user',
    checklist: {
      brandVoice: true,
      policyCheck: false,
      linkCheck: true,
      guidelineCheck: true,
      ctaCheck: true
    },
    comments: []
  }
];
