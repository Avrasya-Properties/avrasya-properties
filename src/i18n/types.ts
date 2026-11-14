export type Locale = "en" | "tr" | "ar" | "ru" | "fa" | "zh" | "bn";

export type Direction = "ltr" | "rtl";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: Direction;
}

export interface NavTranslations {
  properties: string;
  calculator: string;
  whyTurkiye: string;
  investing: string;
  citizenship: string;
  services: string;
  about: string;
  contact: string;
  bookConsultation: string;
  saved: string;
  currency: string;
  language: string;
  advisoryDesk: string;
  home: string;
  closeMenu: string;
  openMenu: string;
  viewShortlist: string;
  displayCurrency: string;
  whatsApp: string;
  advisoryServices: string;
}

export interface FooterTranslations {
  explorePortfolio: string;
  allOffers: string;
  acquisitionCalculator: string;
  citizenshipAdvice: string;
  advisoryServices: string;
  investmentCatalog: string;
  advisoryMarket: string;
  aboutAvrasya: string;
  whyTurkiyeNav: string;
  investorJourney: string;
  directConsultation: string;
  headquarters: string;
  directAdvisoryEmail: string;
  directWhatsAppLine: string;
  officeAddress: string;
  disclaimerNote: string;
  rightsReserved: string;
  builtBy: string;
  privacyPolicy: string;
  termsConditions: string;
  cookiePolicy: string;
  investmentDisclaimer: string;
  tagline: string;
  description: string;
  realEstateAdvisoryBadge: string;
}

export interface CtaTranslations {
  eyebrow: string;
  title: string;
  description: string;
  requestConsultation: string;
  chatWhatsApp: string;
  whatsappDirect: string;
  advisoryEyebrow: string;
  consultationTitle: string;
  consultationSubtitle: string;
  scheduleMeeting: string;
}

export interface HomeTranslations {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleEm: string;
  heroSubtitle: string;
  browseProperties: string;
  exploreByArea: string;
  filterDistrict: string;
  filterAllDistricts: string;
  filterSide: string;
  filterAllSides: string;
  filterSideEurope: string;
  filterSideAsia: string;
  filterLayout: string;
  filterAllLayouts: string;
  filterBudget: string;
  filterAnyBudget: string;
  filterCbiOnly: string;
  filterSearchBtn: string;
  regionsEyebrow: string;
  regionsTitle: string;
  regionsSubtitle: string;
  regionsOpen: string;
  heroCta: string;
  stat1Title: string;
  stat1Desc: string;
  stat2Title: string;
  stat2Desc: string;
  stat3Title: string;
  stat3Desc: string;
  stat4Title: string;
  stat4Desc: string;
  editorialEyebrow: string;
  editorialTitle: string;
  editorialTitleEm: string;
  editorialSubtitle: string;
  viewAllOffers: string;
  bosphorusEyebrow: string;
  bosphorusTitle: string;
  bosphorusTitleEm: string;
  bosphorusSubtitle: string;
  cbiEyebrow: string;
  cbiTitle: string;
  cbiTitleEm: string;
  cbiSubtitle: string;
  cbiPillar1Title: string;
  cbiPillar1Desc: string;
  cbiPillar2Title: string;
  cbiPillar2Desc: string;
  cbiPillar3Title: string;
  cbiPillar3Desc: string;
  cbiPillar4Title: string;
  cbiPillar4Desc: string;
  cbiExploreRoadmap: string;
  cbiCheckQualifications: string;
  calcEyebrow: string;
  calcTitle: string;
  calcTitleEm: string;
  calcSubtitle: string;
  calcOpenCalculator: string;
  whyEyebrow: string;
  whyTitle: string;
  whyTitleEm: string;
  whySubtitle: string;
  whyPillar1Title: string;
  whyPillar1Desc: string;
  whyPillar2Title: string;
  whyPillar2Desc: string;
  whyPillar3Title: string;
  whyPillar3Desc: string;
  whyPillar4Title: string;
  whyPillar4Desc: string;
}

export interface PropertiesTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  searchPlaceholder: string;
  allDistricts: string;
  allRegions: string;
  filterRegion: string;
  regionViewListings: string;
  regionDistrictsTitle: string;
  regionEmpty: string;
  regionListingsLabel: string;
  allSides: string;
  sideEurope: string;
  sideAsia: string;
  allLayouts: string;
  allBudgets: string;
  allTypes: string;
  cbiOnly: string;
  savedOnly: string;
  sortBy: string;
  sortLowest: string;
  sortHighest: string;
  sortNewest: string;
  resetFilters: string;
  clearSavedFilter: string;
  showingCount: string;
  noResultsTitle: string;
  noResultsDesc: string;
  viewingGrid: string;
  viewingList: string;
}

export interface PropertyCardTranslations {
  perM2: string;
  cbiVerified: string;
  cbiToConfirm: string;
  viewDetails: string;
  priceOnRequest: string;
  forRent: string;
  forSale: string;
  saved: string;
  save: string;
  photoNotSupplied: string;
  inquireWhatsApp: string;
}

export interface PropertyDetailTranslations {
  backToProperties: string;
  home: string;
  properties: string;
  share: string;
  shareSuccess: string;
  saved: string;
  save: string;
  cbiVerified: string;
  cbiToConfirm: string;
  askingPrice: string;
  monthlyRent: string;
  subjectToContract: string;
  fullscreen: string;
  previousImage: string;
  nextImage: string;
  floorPlan: string;
  noPhotos: string;
  specificationsEyebrow: string;
  specificationsTitle: string;
  district: string;
  istanbulSide: string;
  listingType: string;
  forRent: string;
  forSale: string;
  bathrooms: string;
  bedrooms: string;
  availability: string;
  toConfirm: string;
  titleDeedStatus: string;
  apartmentLayout: string;
  grossArea: string;
  netArea: string;
  areaToConfirm: string;
  development: string;
  priceDetails: string;
  priceDetailsNotice: string;
  propertyDescription: string;
  highlightsEyebrow: string;
  highlightsTitle: string;
  legalVerificationEyebrow: string;
  legalVerificationTitle: string;
  legalVerificationDesc: string;
  spkAppraisal: string;
  spkAppraisalDesc: string;
  dabCertificate: string;
  dabCertificateDesc: string;
  titleDeedClean: string;
  titleDeedCleanDesc: string;
  bookViewing: string;
  bookViewingDesc: string;
  whatsappDirect: string;
  similarProperties: string;
  similarSubtitle: string;
  notPublishedTitle: string;
  notPublishedDesc: string;
  browseCurrent: string;
}

export interface AboutTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  missionTitle: string;
  missionText1: string;
  missionText2: string;
  standardsEyebrow: string;
  standardsTitle: string;
  standard1Title: string;
  standard1Desc: string;
  standard2Title: string;
  standard2Desc: string;
  standard3Title: string;
  standard3Desc: string;
  standard4Title: string;
  standard4Desc: string;
  leadershipEyebrow: string;
  leadershipTitle: string;
  leader1Role: string;
  leader1Desc: string;
  leader2Role: string;
  leader2Desc: string;
  leader3Role: string;
  leader3Desc: string;
  officeEyebrow: string;
  officeTitle: string;
  officeAddressLabel: string;
  officeHoursLabel: string;
  officeHoursVal: string;
  officeDesc: string;
  requestConsultation: string;
}

export interface CitizenshipTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  calcEyebrow: string;
  calcTitle: string;
  calcSubtitle: string;
  propertyPriceLabel: string;
  includeSpouse: string;
  childrenCountLabel: string;
  vatExemptLabel: string;
  vatExemptNote: string;
  breakdownTitle: string;
  breakdownPropertyPrice: string;
  breakdownTapuFee: string;
  breakdownSpk: string;
  breakdownDabNotary: string;
  breakdownLegal: string;
  breakdownGovtFiling: string;
  totalEstimatedOutlay: string;
  cbiQualifiedTag: string;
  cbiDeficitTag: string;
  stepsEyebrow: string;
  stepsTitle: string;
  step1Title: string;
  step1Desc: string;
  step1Duration: string;
  step2Title: string;
  step2Desc: string;
  step2Duration: string;
  step3Title: string;
  step3Desc: string;
  step3Duration: string;
  step4Title: string;
  step4Desc: string;
  step4Duration: string;
  step5Title: string;
  step5Desc: string;
  step5Duration: string;
  keyRequirementsEyebrow: string;
  keyRequirementsTitle: string;
  req1Title: string;
  req1Desc: string;
  req2Title: string;
  req2Desc: string;
  req3Title: string;
  req3Desc: string;
  req4Title: string;
  req4Desc: string;
  startCbiConsultation: string;
}

export interface WhyTurkiyeTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  districtsEyebrow: string;
  districtsTitle: string;
  districtsSubtitle: string;
  filterEuropean: string;
  filterAsian: string;
  pricePerM2: string;
  targetYield: string;
  viewPropertiesInDistrict: string;
  macroEyebrow: string;
  macroTitle: string;
  macro1Title: string;
  macro1Desc: string;
  macro2Title: string;
  macro2Desc: string;
  macro3Title: string;
  macro3Desc: string;
  macro4Title: string;
  macro4Desc: string;
  freeholdEyebrow: string;
  freeholdTitle: string;
  freeholdDesc: string;
  freeholdPoint1: string;
  freeholdPoint2: string;
  freeholdPoint3: string;
  freeholdPoint4: string;
}

export interface InvestmentTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  strategiesEyebrow: string;
  strategiesTitle: string;
  strat1Title: string;
  strat1Yield: string;
  strat1Horizon: string;
  strat1Profile: string;
  strat1Point1: string;
  strat1Point2: string;
  strat1Point3: string;
  strat2Title: string;
  strat2Yield: string;
  strat2Horizon: string;
  strat2Profile: string;
  strat2Point1: string;
  strat2Point2: string;
  strat2Point3: string;
  strat3Title: string;
  strat3Yield: string;
  strat3Horizon: string;
  strat3Profile: string;
  strat3Point1: string;
  strat3Point2: string;
  strat3Point3: string;
  stepsEyebrow: string;
  stepsTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  step6Title: string;
  step6Desc: string;
  taxesEyebrow: string;
  taxesTitle: string;
  tax1Title: string;
  tax1Desc: string;
  tax2Title: string;
  tax2Desc: string;
  tax3Title: string;
  tax3Desc: string;
  redFlagsEyebrow: string;
  redFlagsTitle: string;
  redFlag1Title: string;
  redFlag1Desc: string;
  redFlag2Title: string;
  redFlag2Desc: string;
  redFlag3Title: string;
  redFlag3Desc: string;
}

export interface CalculatorTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  tabClosing: string;
  tabYield: string;
  tabCbi: string;
  tabHolding: string;
  propertyPriceLabel: string;
  tapuShareFull: string;
  tapuShareSplit: string;
  vatExemptLabel: string;
  vatExemptSub: string;
  summaryTitle: string;
  totalAcquisitionCost: string;
  closingCostsTotal: string;
  closingCostRatio: string;
  tapuDeedTax: string;
  vatTax: string;
  spkValuation: string;
  notaryDab: string;
  legalReview: string;
  cbiEligibilityStatus: string;
  cbiExceeds: string;
  cbiShortfall: string;
  copyBreakdown: string;
  copiedToast: string;
  whatsappShare: string;
  rentalYieldTitle: string;
  grossYieldPct: string;
  mgmtFeePct: string;
  annualDaskInsurance: string;
  monthlyAidatFee: string;
  estimatedGrossRentAnnual: string;
  estimatedNetRentAnnual: string;
  estimatedMonthlyNetRent: string;
  netYieldReturn: string;
  cbiModelTitle: string;
  holdingTaxTitle: string;
  holding5YearZeroTax: string;
  holding5YearDesc: string;
}

export interface TimelineStep {
  stepNumber: string; // e.g. "01", "02" ... "09"
  title: string;
  description: string;
  termNote?: string; // e.g. "Tapu [Title Deed]", "DAB [Currency Exchange Certificate]"
  legalTag?: string; // Lawyer review flag
}

export interface TimelinePart {
  partNumber: string; // e.g. "PART 1", "PART 2"
  title: string; // e.g. "CHOOSE", "BUY", "CITIZENSHIP", "AFTER CITIZENSHIP (OPTIONAL)"
  steps: TimelineStep[];
}

export interface ServicesTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  subtitle: string;
  description: string;
  closingLine: string;
  legalDisclaimer: string;
  parts: TimelinePart[];
  coreServicesEyebrow: string;
  coreServicesTitle: string;
  deliverablesLabel: string;
  faqEyebrow: string;
  faqTitle: string;
  services: {
    title: string;
    category: string;
    desc: string;
    deliverables: string[];
  }[];
  faqs: {
    q: string;
    a: string;
  }[];
}

export interface ContactTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  topicTitle: string;
  topicCitizenship: string;
  topicResidential: string;
  topicCommercial: string;
  topicManagement: string;
  directChannels: string;
  officeVisiting: string;
  addressLabel: string;
  hoursLabel: string;
  hoursValue: string;
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  scheduleMeeting: string;
}

export interface CatalogTranslations {
  eyebrow: string;
  title: string;
  titleEm: string;
  description: string;
  downloadEyebrow: string;
  downloadTitle: string;
  downloadDesc: string;
  downloadPdfBtn: string;
  phasesEyebrow: string;
  phasesTitle: string;
  metricsEyebrow: string;
  metricsTitle: string;
  phases: { phase: string; title: string; desc: string }[];
  metrics: { label: string; val: string; sub: string }[];
}

export interface EnquiryTranslations {
  title: string;
  subtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  topic: string;
  budget: string;
  budgetPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submitBtn: string;
  submitting: string;
  successTitle: string;
  successDesc: string;
  errorDesc: string;
  whatsappAlternative: string;
  directWhatsappBtn: string;
  termsConsent: string;
  propertyReference: string;
  errName: string;
  errEmail: string;
  errPhone: string;
  errMessage: string;
  errConsent: string;
  errFix: string;
  errTimeout: string;
  errNetwork: string;
  successNext: string;
  newEnquiry: string;
}

export interface LegalDraftTranslations {
  eyebrow: string;
  statusWarning: string;
  approvedCovers: string;
  questionsPrompt: string;
  contactLink: string;
  unapproved: string;
  status: string;
  expected: string;
  questions: string;
  contactTeam: string;
}

export interface CommonTranslations {
  loading: string;
  error: string;
  retry: string;
  allRightsReserved: string;
  pageNotFoundTitle: string;
  pageNotFoundDesc: string;
  goHome: string;
  exploreOffers: string;
  skipToContent: string;
  priceOnRequest: string;
  requestCurrentOptions: string;
  confirmOfferDetails: string;
  packageTotal: string;
  unitOffer: string;
  unitType: string;
  multiApartmentPackage: string;
  projectIntroduction: string;
  offerToConfirm: string;
  sideEurope: string;
  sideAsia: string;
  sideUnknown: string;
  viewAll: string;
  contactUs: string;
  inquire: string;
  all: string;
  directInquiries: string;
}

export interface ChromeTranslations {
  navLocations: string;
  navDestinations: string;
  navPortfolio: string;
  navBrandSubtitle: string;
  menuLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  switchToLight: string;
  switchToDark: string;
  selectLanguage: string;
  changeLanguage: string;
  languageHeader: string;
  currencyLabel: string;
  quickLinksTitle: string;
  exploreTitle: string;
  contactInfoTitle: string;
  footerTagline: string;
  footerCopyright: string;
  managedUnavailable: string;
  errorUnexpected: string;
  errorHeading: string;
  errorFallback: string;
  backToHomepage: string;
  notFoundEyebrow: string;
  notFoundButton: string;
  fallbackPropertyAlt: string;
  breadcrumbAria: string;
}

export interface HeroShowcaseTranslations {
  topBar: string;
  headlineWord1: string;
  headlineWord2: string;
  headlineWord3: string;
  headlineWord4: string;
  subtitle: string;
  exploreProperties: string;
  watchLabel: string;
  showreelLabel: string;
  openShowreelAria: string;
  keepScrolling: string;
  tapuBadge: string;
  discoverLead: string;
  discoverCta: string;
  highlightedServiceEyebrow: string;
  highlightedServiceTitle: string;
  emptyCollection: string;
  skyCtaTitleLine1: string;
  skyCtaTitleItalicLine2: string;
  skyCtaSubtitle: string;
  skyCtaPrimary: string;
  skyCtaSecondary: string;
}

export interface ViewingModalTranslations {
  eyebrow: string;
  dialogTitle: string;
  tabShowreel: string;
  tabBooking: string;
  closeAria: string;
  cinemaBadge: string;
  cinemaTitle: string;
  statPortfolioLabel: string;
  statPortfolioVal: string;
  statYieldLabel: string;
  statYieldVal: string;
  statTapuLabel: string;
  statTapuVal: string;
  scheduleVisitCta: string;
  confirmedTitle: string;
  confirmedDesc: string;
  doneBtn: string;
  fieldNameLabel: string;
  fieldNamePlaceholder: string;
  fieldContactLabel: string;
  fieldContactPlaceholder: string;
  fieldDateLabel: string;
  fieldDistrictLabel: string;
  districtOpt1: string;
  districtOpt2: string;
  districtOpt3: string;
  districtOpt4: string;
  submitBtn: string;
  footerNote: string;
}

export interface AboutSectionTranslations {
  badge: string;
  heading: string;
  description: string;
  statement: string;
  portfolioBadge: string;
  portfolioHeading: string;
  imageAltPrefix: string;
  metrics: Array<{ value: string; label: string }>;
}

export interface AboutPageExtendedTranslations {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  stats: Array<{ number: string; label: string; desc: string }>;
  ourStoryBadge: string;
  ourStoryHeading: string;
  ourStoryP1: string;
  ourStoryP2: string;
  officeBadgeText: string;
  coreValuesBadge: string;
  coreValuesHeading: string;
  coreValuesSubtitle: string;
  approachSteps: Array<{ step: string; title: string; desc: string }>;
  expertiseBadge: string;
  expertiseHeading: string;
  expertiseItems: Array<{ tag: string; title: string; desc: string }>;
  teamBadge: string;
  teamHeading: string;
  teamSubtitle: string;
  teamMembers: Array<{ role: string; bio: string; languages: string }>;
  partnersBadge: string;
  partnersHeading: string;
  partnersSubtitle: string;
  partnerCategories: Array<{ category: string; description: string }>;
  visitBadge: string;
  visitHeading: string;
  visitDesc: string;
  officeLabel: string;
  officeHoursLabel: string;
  officeHoursVal: string;
  officeEmailLabel: string;
  officePhoneLabel: string;
  getDirections: string;
  directAdvisoryCta: string;
}

export interface ServicesUiTranslations {
  highlightedService: string;
  avrasyaDifference: string;
  legalRepHeading: string;
  allServicesBtn: string;
  moreDetailsBtn: string;
  processNavAria: string;
  valuesBadge: string;
  valuesHeading: string;
  valuesSubtitle: string;
  valuesItems: Array<{
    number: string;
    title: string;
    desc: string;
    deliverables: string[];
  }>;
  privateDeskBadge: string;
  bespokeHeading: string;
  scheduleConsultation: string;
  timelineLabel: string;
  months3to6: string;
  years3: string;
  passportBannerEyebrow: string;
  passportBannerTitle: string;
  passportBannerDesc: string;
  stepLabel: string;
  globalFreedomEyebrow: string;
  advantagesTitle: string;
  benefits: Array<{ title: string; desc: string }>;
  helpfulFaqs: string;
  importantNotice: string;
  regulatoryNotice: string;
  fullAdvisoryGovernance: string;
  buildingFallbackEyebrow: string;
  buildingFallbackTitle: string;
  buildingFallbackBadge: string;
  buildingFallbackTagline: string;
  buildingFallbackHint: string;
  passportFallbackEyebrow: string;
  passportFallbackTitle: string;
  passportFallbackBadge: string;
  passportFallbackHint: string;
  passportCoverTop: string;
  passportCoverMain: string;
  passportCoverSub: string;
}

export interface ProjectsShowcaseTranslations {
  eyebrow: string;
  heading: string;
  subtitle: string;
  viewDossier: string;
  selectResidenceAria: string;
  defaultProjects: Array<{
    category: string;
    year: string;
    title: string;
    description: string;
  }>;
}

export interface PartnersSectionTranslations {
  heading: string;
  referencesAndPartners: string;
}

export interface RegionsShowcaseTranslations {
  ourLocations: string;
  fourRegions: string;
  oneStandard: string;
  locationsSubtitle: string;
  keyDistrictsLabel: string;
  publishedAvailableSuffix: string;
  privatePortfolioNote: string;
  exploreProperties: string;
  explorePropertiesIn: string;
  avgPriceM2: string;
  priceGrowthYoY: string;
  grossYield: string;
  residencesLabel: string;
  featuredPropertyLabel: string;
  previousLocationAria: string;
  nextLocationAria: string;
  allLocationsBtn: string;
  locationsIndexBtn: string;
  regionNotAvailableTitle: string;
  regionNotAvailableDesc: string;
  availableResidencesIn: string;
  residenceSingular: string;
  residencesPlural: string;
  consideredLabel: string;
  openFullFilter: string;
  requestShortlist: string;
  browseIstanbul: string;
  regionDescriptions: Record<string, string>;
  locationCards: Record<
    string,
    { title: string; subtitle: string; description: string; featuredDistrict: string }
  >;
}

export interface PropertiesExtraTranslations {
  everyResidence: string;
  considered: string;
  countIntroPrefix: string;
  residenceCountSuffix: string;
  labelLocation: string;
  labelPropertyType: string;
  labelPrice: string;
  labelBedrooms: string;
  labelSide: string;
  searchBtn: string;
  moreFilters: string;
  grid: string;
  list: string;
  map: string;
  listView: string;
  neighborhood: string;
  allNeighborhoods: string;
  category: string;
  allCategories: string;
  project: string;
  allDevelopments: string;
  completionStatus: string;
  anyStatus: string;
  ready: string;
  underConstruction: string;
  offPlan: string;
  minArea: string;
  maxArea: string;
  minPrice: string;
  maxPrice: string;
  atlasEyebrow: string;
  atlasTitle: string;
  atlasHint: string;
  atlasFooter: string;
  portfolioPackage: string;
  combinableCbi: string;
  viewResidence: string;
  viewShort: string;
  inLocationPrefix: string;
  typeLabels: {
    single_unit: string;
    package: string;
    project: string;
  };
  detail: {
    photoUnavailable: string;
    downPayment: string;
    atDelivery: string;
    allCategory: string;
    neighborhood: string;
    propertyCategory: string;
    livingRooms: string;
    floorNumber: string;
    totalFloors: string;
    furnishingStatus: string;
    completionStatus: string;
    constructionYear: string;
    propertyCondition: string;
    heatingSystem: string;
    viewOrientation: string;
    orientation: string;
    balconyTerrace: string;
    gardenOutdoor: string;
    parking: string;
    energyClass: string;
    propertyFeatures: string;
    feesNotesHeading: string;
    additionalFees: string;
    rentalYield: string;
    capitalGrowth: string;
    citizenshipNote: string;
    paymentPlansHeading: string;
    totalPrice: string;
    downPaymentShare: string;
    numPayments: string;
    regularPayment: string;
    paymentLabel: string;
    monthLabel: string;
    packageContents: string;
    unitIncludedFallback: string;
    docsWalkthroughEyebrow: string;
    documentFallback: string;
    watchVideo: string;
    view3dModel: string;
    locationConnectivityEyebrow: string;
    mapLocationFor: string;
    galleryAria: string;
    closeLightboxAria: string;
    formerlyAdvertised: string;
    sourceListPrice: string;
    installmentOption: string;
    installmentSchedule: string;
    installmentsLabel: string;
    monthsSuffix: string;
    downShort: string;
    developerFallback: string;
    deliveryLabel: string;
    blockLabel: string;
    floorLabel: string;
    unitLabel: string;
  };
}

export interface BosphorusAndWhyExtraTranslations {
  chooseNeighborhood: string;
  areasSuffix: string;
  areaLabel: string;
  sideSuffix: string;
  returnLabel: string;
  districtOverview: string;
  refLabel: string;
  expectedReturn: string;
  priceRange: string;
  perM2Usd: string;
  expectedRentalReturn: string;
  usdIndexedLeases: string;
  airportTravel: string;
  valueGrowth: string;
  indicativeDisclaimer: string;
  whyLoveNeighborhood: string;
  titleDeedLabel: string;
  tenantProfileLabel: string;
  lifeInIstanbul: string;
  intlSchools: string;
  intlSchoolsDesc: string;
  worldHealthcare: string;
  worldHealthcareDesc: string;
  modernTransit: string;
  modernTransitDesc: string;
  exploreAvailableHomes: string;
  timelineWeeks: Record<string, string>;
  strategyProfileLabel: string;
  expectedNetReturnLabel: string;
  targetProfileLabel: string;
  keyFeaturesLabel: string;
  recommendedHoldLabel: string;
  browseMatchingBtn: string;
  whyDistricts: Array<{
    name: string;
    category: string;
    tagline: string;
    features: string[];
  }>;
  corridors: Record<
    string,
    {
      name: string;
      subName: string;
      tagline: string;
      appreciation: string;
      airportTime: string;
      tenantProfile: string;
      titleDeedStatus: string;
      keyStrengths: string[];
    }
  >;
}

export interface CalculatorExtraTranslations {
  presetsLabel: string;
  cbiBadge: string;
  approxPrefix: string;
  netUsdNote: string;
  perYearThreeYr: string;
  estimateDisclaimer: string;
  law4721Title: string;
  law4721Sub: string;
  law4721Desc: string;
  law3065Title: string;
  law3065Sub: string;
  law3065Desc: string;
  tcmbTitle: string;
  tcmbSub: string;
  tcmbDesc: string;
  returnAnalysisBadge: string;
  usdEurLeases: string;
  yieldSubtitle: string;
  perYearSuffix: string;
  perMonthSuffix: string;
  operatingDeductionsHeading: string;
  yrShort: string;
  moShort: string;
  usdPerYr: string;
  netMonthlyLabel: string;
  totalAnnualOverhead: string;
  threeYrCashflow: string;
  fiveYrCashflow: string;
  requestHighYieldBtn: string;
  turkishCbiProgram: string;
  law5901: string;
  minCbiBtn: string;
  bufferBtn: string;
  familyComposition: string;
  applicantsSuffix: string;
  primaryInvestor: string;
  primaryInvestorDesc: string;
  oneMandatory: string;
  spouseRegisteredDesc: string;
  under18Label: string;
  postAcquisitionBadge: string;
  immLabel: string;
  municipalTaxTitle: string;
  municipalTaxSub: string;
  annualAidatSuffix: string;
  monthlyLabel: string;
}

export interface EnquiryExtraTranslations {
  servicesList: string[];
  topicPills: Array<{ id: string; label: string; full: string }>;
  budgetPresets: Array<{ label: string; value: string }>;
  requirementTags: string[];
  targetRegionLabel: string;
  regionsList: string[];
  quickTagsLabel: string;
  reassuranceText: string;
  connectWhatsappSuffix: string;
  receiptBriefRegistered: string;
  receiptRefLabel: string;
  receiptDeliveredInbox: string;
  receiptAdvisorFollowup: string;
  receiptClientLabel: string;
  receiptPhoneLabel: string;
  receiptTopicLabel: string;
  receiptBudgetLabel: string;
  receiptMessageLabel: string;
  chatWhatsappEnquiryBtn: string;
  defaultTopicFallback: string;
  contactHeroOr: string;
}

export interface LegalDraftPagesTranslations {
  privacyTitle: string;
  privacyTopics: string[];
  termsTitle: string;
  termsTopics: string[];
  cookieTitle: string;
  cookieTopics: string[];
  disclaimerTitle: string;
  disclaimerTopics: string[];
}

export interface AppTranslations {
  common: CommonTranslations;
  nav: NavTranslations;
  footer: FooterTranslations;
  cta: CtaTranslations;
  home: HomeTranslations;
  properties: PropertiesTranslations;
  propertyCard: PropertyCardTranslations;
  propertyDetail: PropertyDetailTranslations;
  about: AboutTranslations;
  citizenship: CitizenshipTranslations;
  whyTurkiye: WhyTurkiyeTranslations;
  investment: InvestmentTranslations;
  calculator: CalculatorTranslations;
  services: ServicesTranslations;
  contact: ContactTranslations;
  catalog: CatalogTranslations;
  enquiry: EnquiryTranslations;
  legalDraft: LegalDraftTranslations;
  chrome: ChromeTranslations;
  heroShowcase: HeroShowcaseTranslations;
  viewingModal: ViewingModalTranslations;
  aboutSection: AboutSectionTranslations;
  aboutPageExtra: AboutPageExtendedTranslations;
  servicesUi: ServicesUiTranslations;
  projectsShowcase: ProjectsShowcaseTranslations;
  partnersSection: PartnersSectionTranslations;
  regionsShowcase: RegionsShowcaseTranslations;
  propertiesExtra: PropertiesExtraTranslations;
  bosphorusAndWhyExtra: BosphorusAndWhyExtraTranslations;
  calculatorExtra: CalculatorExtraTranslations;
  enquiryExtra: EnquiryExtraTranslations;
  legalDraftPages: LegalDraftPagesTranslations;
}
