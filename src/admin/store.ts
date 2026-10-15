// Persistent production repository; fictional local mode requires an explicit build flag.
import { DEMO_MODE } from "@/lib/supabase";
import * as demo from "./demo";
import * as remote from "./remote";
import { usePublicSettings } from "@/data/live";
import type { Collection } from "./mappers";
export * from "./demo";
export const DEMO_ENABLED = DEMO_MODE;
export const USERS = DEMO_MODE ? demo.USERS : remote.staff;
export const useDB = () => (DEMO_MODE ? demo.useDB() : remote.useRemoteDB());
export const useSession = () => (DEMO_MODE ? demo.useSession() : remote.useRemoteSession());
export const getSession = () => (DEMO_MODE ? demo.getSession() : remote.getRemoteSession());
export const login = (email: string, pw: string) =>
  DEMO_MODE ? demo.login(email, pw) : remote.signIn(email, pw);
export const logout = () => (DEMO_MODE ? demo.logout() : remote.signOut());
export const userName = (id: string) => USERS.find((u) => u.id === id)?.name || "Unassigned";
export function useBackendStatus() {
  return DEMO_MODE ? { loading: false, saving: 0, error: "",idleSeconds:0 } : remote.useStatus();
}
export function useSiteSettings() {
  if (DEMO_MODE) return demo.useSiteSettings();
  return usePublicSettings().settings;
}
export const settingsRevision = () => (DEMO_MODE ? "" : remote.settingsRevision());
export const updateSiteSettings = (
  patch: Partial<demo.SiteSettings>,
  expectedRevision?: string,
) =>
  DEMO_MODE
    ? demo.updateSiteSettings(patch)
    : remote.updateSettings(patch, expectedRevision);
export function upsert<T extends { id: string }>(
  coll: Collection,
  item: Record<string, unknown> & { id?: string },
  owner?: string,
): T | Promise<T> {
  return DEMO_MODE ? demo.upsert<T>(coll, item, owner) : remote.upsert<T>(coll, item);
}
export const bulkPublication = (
  ids: string[],
  publication: demo.Property["publication"],
) =>
  DEMO_MODE
    ? demo.bulkPublication(ids, publication)
    : remote.bulkPublication(ids, publication);
export const remove = (coll: Collection, id: string) =>
  DEMO_MODE
    ? demo.remove(coll, id)
    : coll === "inquiries"
      ? remote.upsert<demo.Inquiry>(coll, { id, status: "Archived" })
      : Promise.reject(
          new Error("Archive related records instead of deleting them."),
        );
export const addActivity = (
  kind: string,
  text: string,
  ref?: demo.Activity["ref"],
) =>
  DEMO_MODE
    ? demo.addActivity(kind, text, ref)
    : remote.addActivity(kind, text, ref);
export const markRead = (ids: string[], read: boolean) =>
  DEMO_MODE ? demo.markRead(ids, read) : remote.markRead(ids, read);
export const convertInquiryToLead = (id: string) =>
  DEMO_MODE ? demo.convertInquiryToLead(id) : remote.convertInquiry(id);
export const convertLead = (id: string) =>
  DEMO_MODE ? demo.convertLead(id) : remote.convertLead(id);
export const setDealStage = (id: string, stage: demo.Deal["stage"]) =>
  DEMO_MODE ? demo.setDealStage(id, stage) : remote.setDealStage(id, stage);
export const winDeal = (id: string) => setDealStage(id, "Won");
export const setStage = (
  id: string,
  stage: demo.Lead["stage"],
  lossReason?: string,
) =>
  DEMO_MODE
    ? demo.setStage(id, stage, lossReason)
    : remote.upsert<demo.Lead>("leads", { id, stage, ...(lossReason ? { lossReason } : {}) });
export const createInquiry = (item: Parameters<typeof demo.createInquiry>[0]) =>
  DEMO_MODE ? demo.createInquiry(item) : remote.createInquiry(item);
export const recordPublicEnquiry = (input: demo.PublicEnquiryInput) =>
  DEMO_MODE ? demo.recordPublicEnquiry(input) : remote.recordPublicEnquiry(input);
export const exportBackup = () =>
  DEMO_MODE ? demo.exportBackup() : remote.exportBackup();
export const importBackup = (data: string) =>
  DEMO_MODE
    ? demo.importBackup(data)
    : Promise.reject(
        new Error(
          "Production restore requires a reviewed database migration. Browser backups cannot replace the live database.",
        ),
      );
export const resetData = () =>
  DEMO_MODE
    ? demo.resetData()
    : Promise.reject(new Error("Factory reset is available only in the demo."));
export const uploadImage = remote.uploadImage;
export const resetPassword = remote.resetPassword;
export const changePassword = remote.changePassword;
export const refreshBackend = remote.refresh;

