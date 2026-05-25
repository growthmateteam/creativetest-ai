export interface CampaignSettings {
  objective: string;
  buyingType: string;
  budgetType: "ABO" | "CBO";
  bidStrategy: string;
  spendingLimit: boolean;
}

export interface AdsetSettings {
  pixel: string;
  performanceGoal: string;
  conversionLocation: string;
  conversionEvent: "Schedule" | "Lead";
  attribution: string;
  scheduleEnabled: boolean;
  advantagePlusAudience: boolean;
  location: string;
  placements: {
    facebook: boolean;
    instagram: boolean;
    audienceNetwork: boolean;
    threads: boolean;
    messenger: boolean;
  };
}

export interface AdSettings {
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  urlParametersEnabled: boolean;
  utmParameters: string;
  enhancements: {
    multiAdvertiserAds: boolean;
    sitelinks: boolean;
    optimizeWebsiteDestination: boolean;
    textImprovements: boolean;
    addSubtitles: boolean;
    videoTouchups: boolean;
    relevantComments: boolean;
    enhancedCta: boolean;
    addVideoEffects: boolean;
  };
}

export const defaultCampaignSettings: CampaignSettings = {
  objective: "Leads",
  buyingType: "Auction",
  budgetType: "ABO",
  bidStrategy: "Highest Volume",
  spendingLimit: false,
};

export const defaultAdsetSettings: AdsetSettings = {
  pixel: "",
  performanceGoal: "Maximize Number of Leads",
  conversionLocation: "Website",
  conversionEvent: "Schedule",
  attribution: "7-day click / 1-day engagement / 1-day view",
  scheduleEnabled: false,
  advantagePlusAudience: false,
  location: "United States",
  placements: {
    facebook: true,
    instagram: true,
    audienceNetwork: false,
    threads: false,
    messenger: false,
  },
};

export const defaultAdSettings: AdSettings = {
  headline: "",
  description: "",
  primaryText: "",
  destinationUrl: "",
  urlParametersEnabled: false,
  utmParameters: "",
  enhancements: {
    multiAdvertiserAds: false,
    sitelinks: false,
    optimizeWebsiteDestination: false,
    textImprovements: false,
    addSubtitles: false,
    videoTouchups: false,
    relevantComments: true,
    enhancedCta: false,
    addVideoEffects: false,
  },
};

export const objectiveOptions = ["Leads", "Sales", "Traffic", "Engagement", "Awareness", "App Promotion"];
export const buyingTypeOptions = ["Auction", "Reservation"];
export const bidStrategyOptions = ["Highest Volume", "Cost Per Result Goal", "Bid Cap", "ROAS Goal"];
export const performanceGoalOptions = [
  "Maximize Number of Leads",
  "Maximize Number of Conversions",
  "Maximize Value of Conversions",
  "Maximize Link Clicks",
];
export const conversionLocationOptions = ["Website", "App", "Messenger", "WhatsApp", "Calls"];
