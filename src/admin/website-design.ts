export const DESIGN_FIELDS=[
 {key:"logoDark",label:"Logo on light backgrounds",image:true},
 {key:"logoLight",label:"Logo on dark backgrounds",image:true},
 {key:"heroMain",label:"Main homepage photo",image:true},
 {key:"heroAlt",label:"Second homepage photo",image:true},
 {key:"heroMainTitle",label:"Main photo title"},
 {key:"heroAltTitle",label:"Second photo title"},
 {key:"homeCollectionTitle",label:"Property collection heading"},
 {key:"homeCollectionText",label:"Property collection description"},
 {key:"homeJourneyTitle",label:"Buying journey heading"},
 {key:"footerImage",label:"Additional footer image",image:true},
 {key:"footerNote",label:"Footer description"},
] as const;
export function validPublicImage(value:string){return value===""||value.length<=2048&&/^(https:\/\/|\/images\/)[^\s]+$/.test(value);}
