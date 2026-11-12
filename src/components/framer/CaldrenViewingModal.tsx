import React, { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";

export interface CaldrenViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "viewing" | "showreel";
  propertyTitle?: string;
  propertyLocation?: string;
  agentName?: string;
  agentRole?: string;
  agentEmail?: string;
  agentPhone?: string;
  onSubmitInquiry?: (payload: {
    name: string;
    email: string;
    phone: string;
    date: string;
    viewingType: string;
    notes: string;
  }) => void;
}

export const CaldrenViewingModal: React.FC<CaldrenViewingModalProps> = ({
  isOpen,
  onClose,
  mode = "viewing",
  propertyTitle = "Aurelia Bosphorus Residences",
  propertyLocation = "Beşiktaş · Istanbul, Türkiye",
  agentName = "Selin Arda",
  agentRole = "Senior Private Client Advisor",
  agentEmail = "info@avrasyaproperties.com",
  agentPhone = "+90 545 924 80 42",
  onSubmitInquiry,
}) => {
  const [activeTab, setActiveTab] = useState<"viewing" | "showreel">(mode);
  const [submitted, setSubmitted] = useState(false);
  const [viewingType, setViewingType] = useState("Private In-Person");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    setActiveTab(mode);
  }, [mode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitInquiry?.({
      ...formData,
      viewingType,
    });
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        activeTab === "showreel" ? "Avrasya Architectural Showreel" : "Schedule a Private Viewing"
      }
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0e0e0c]/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={resetAndClose}
    >
      <div
        className="relative w-full max-w-[960px] overflow-hidden border border-[#0e0e0c]/12 bg-[#f5f2ec] text-[#0e0e0c] shadow-[0_32px_90px_rgba(14,14,12,0.38)]"
        style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Mode Switcher & Close Bar */}
        <div className="flex items-center justify-between border-b border-[#0e0e0c]/10 bg-white px-6 py-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("showreel")}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                activeTab === "showreel"
                  ? "bg-[#0e0e0c] text-white"
                  : "text-[#63615b] hover:text-[#0e0e0c]"
              }`}
            >
              Architectural Showreel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("viewing")}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                activeTab === "viewing"
                  ? "bg-[#0e0e0c] text-white"
                  : "text-[#63615b] hover:text-[#0e0e0c]"
              }`}
            >
              Private Viewing Brief
            </button>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0e0e0c]/12 text-[#0e0e0c] transition-colors hover:bg-[#0e0e0c] hover:text-white"
          >
            ✕
          </button>
        </div>

        {activeTab === "showreel" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="relative flex min-h-[360px] flex-col justify-between bg-[#0e0e0c] p-8 text-white lg:col-span-8">
              <img
                src={resolvePlaceholderSrc(PLACEHOLDER_IMAGES.hero.towerSkyline)}
                alt={PLACEHOLDER_IMAGES.hero.towerSkyline.alt}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0c] via-[#0e0e0c]/30 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  Avrasya Showreel · Placeholder Preview
                </span>
                <span className="text-[11px] tracking-[0.12em] text-white/70">02:14 · 4K HDR</span>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-2xl backdrop-blur-md">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="8 5 19 12 8 19 8 5" />
                  </svg>
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/80">
                  Architectural Reel Placeholder
                </p>
              </div>

              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">
                  {propertyLocation}
                </p>
                <h3
                  className="mt-1 text-2xl font-normal tracking-[-0.02em] text-white"
                  style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
                >
                  {propertyTitle} — Curated Portfolio Film
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white p-8 lg:col-span-4">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#94918a]">
                  Featured Development
                </p>
                <h4 className="mt-2 text-xl font-medium tracking-[-0.03em] text-[#0e0e0c]">
                  Exceptional spaces, thoughtfully presented.
                </h4>
                <p className="mt-3 text-[13px] leading-[1.6] text-[#63615b]">
                  Every residence in the Avrasya portfolio undergoes independent valuation, Tapu
                  title clearance, and architectural review before private presentation.
                </p>

                <div className="mt-6 space-y-3 border-t border-[#0e0e0c]/10 pt-5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#94918a]">Locations</span>
                    <span className="font-medium text-[#0e0e0c]">Istanbul · Bodrum · Coast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94918a]">Advisory Scope</span>
                    <span className="font-medium text-[#0e0e0c]">Acquisition & Citizenship</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94918a]">Legal Clearance</span>
                    <span className="font-medium text-[#0e0e0c]">100% Title Verified</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("viewing")}
                className="mt-8 flex w-full items-center justify-between rounded-full bg-[#0e0e0c] px-5 py-3 text-[12px] font-medium text-white transition-transform hover:scale-[1.01]"
              >
                <span>Arrange Private Viewing</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0e0e0c]">
                  →
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Advisor Dossier Column */}
            <div className="flex flex-col justify-between bg-[#0e0e0c] p-8 text-white md:col-span-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  Private Client Desk
                </span>
                <h3 className="mt-3 text-2xl font-medium leading-tight tracking-[-0.03em] text-white">
                  {propertyTitle}
                </h3>
                <p className="mt-2 text-[13px] text-white/65">{propertyLocation}</p>
              </div>

              <div className="mt-10 border-t border-white/15 pt-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Assigned Advisor
                </span>
                <div className="mt-2 text-[16px] font-medium text-white">{agentName}</div>
                <div className="text-[12px] text-white/65">{agentRole}</div>
                <div className="mt-4 space-y-1 text-[12px] text-white/80">
                  <div>{agentEmail}</div>
                  <div>{agentPhone}</div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="bg-white p-8 md:col-span-7">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0e0e0c] text-white">
                    ✓
                  </div>
                  <h4 className="mt-4 text-xl font-medium tracking-[-0.02em] text-[#0e0e0c]">
                    Viewing Request Registered
                  </h4>
                  <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[#63615b]">
                    Thank you. {agentName} will contact you shortly to confirm your private
                    itinerary and dossier.
                  </p>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="mt-6 rounded-full bg-[#0e0e0c] px-6 py-2.5 text-[12px] font-medium text-white"
                  >
                    Return to Portfolio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Your full name"
                      className="mt-1.5 w-full border border-[#0e0e0c]/15 bg-[#f5f2ec]/60 px-3.5 py-2.5 text-[13px] text-[#0e0e0c] outline-none focus:border-[#0e0e0c]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                        placeholder="name@domain.com"
                        className="mt-1.5 w-full border border-[#0e0e0c]/15 bg-[#f5f2ec]/60 px-3.5 py-2.5 text-[13px] text-[#0e0e0c] outline-none focus:border-[#0e0e0c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
                        placeholder="+90 545 ..."
                        className="mt-1.5 w-full border border-[#0e0e0c]/15 bg-[#f5f2ec]/60 px-3.5 py-2.5 text-[13px] text-[#0e0e0c] outline-none focus:border-[#0e0e0c]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((s) => ({ ...s, date: e.target.value }))}
                        className="mt-1.5 w-full border border-[#0e0e0c]/15 bg-[#f5f2ec]/60 px-3.5 py-2.5 text-[13px] text-[#0e0e0c] outline-none focus:border-[#0e0e0c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                        Format
                      </label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {["Private In-Person", "Live Video Tour"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setViewingType(type)}
                            className={`border px-2.5 py-2.5 text-[11px] font-medium transition-colors ${
                              viewingType === type
                                ? "border-[#0e0e0c] bg-[#0e0e0c] text-white"
                                : "border-[#0e0e0c]/15 bg-transparent text-[#0e0e0c]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#63615b]">
                      Advisory Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Preferred districts, citizenship requirements, or portfolio goals..."
                      className="mt-1.5 w-full border border-[#0e0e0c]/15 bg-[#f5f2ec]/60 px-3.5 py-2 text-[13px] text-[#0e0e0c] outline-none focus:border-[#0e0e0c]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0e0e0c] py-3.5 text-[12px] font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
                  >
                    <span>Confirm Private Viewing</span>
                    <span>→</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaldrenViewingModal;
