import React, { useState } from "react";
import { Link } from "@tanstack/react-router";

export interface UnitRow {
  unit: string;
  beds: string;
  floor: string;
  area: string;
  aspect: string;
  status: "Available" | "Reserved" | "Sold";
  price: string;
  slug?: string;
}

export interface CaldrenDevelopmentTableProps {
  title?: string;
  subtitle?: string;
  units?: UnitRow[];
  onSelectUnit?: (unit: UnitRow) => void;
}

const DEFAULT_UNITS: UnitRow[] = [
  {
    unit: "A-1201",
    beds: "2+1 Residence",
    floor: "12",
    area: "128 m²",
    aspect: "South-West · Bosphorus",
    status: "Available",
    price: "$540,000",
  },
  {
    unit: "A-1402",
    beds: "3+1 Corner Suite",
    floor: "14",
    area: "184 m²",
    aspect: "West · Strait Panorama",
    status: "Available",
    price: "$790,000",
  },
  {
    unit: "A-1501",
    beds: "1+1 Atelier",
    floor: "15",
    area: "92 m²",
    aspect: "East · Courtyard Garden",
    status: "Reserved",
    price: "$415,000",
  },
  {
    unit: "B-1801",
    beds: "3+1 Sky Residence",
    floor: "18",
    area: "210 m²",
    aspect: "South · Historic Peninsula",
    status: "Available",
    price: "$920,000",
  },
  {
    unit: "PH-01",
    beds: "4+1 Duplex Penthouse",
    floor: "22",
    area: "340 m²",
    aspect: "360° Full Bosphorus",
    status: "Available",
    price: "$1,850,000",
  },
];

export const CaldrenDevelopmentTable: React.FC<CaldrenDevelopmentTableProps> = ({
  title = "Residence Schedule & Availability",
  subtitle = "Select any residence row to inspect its architectural floorplan schematic and title clearance status.",
  units = DEFAULT_UNITS,
  onSelectUnit,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitRow>(units[0] || DEFAULT_UNITS[0]!);

  const handleRowClick = (u: UnitRow) => {
    setSelectedUnit(u);
    onSelectUnit?.(u);
  };

  return (
    <section
      className="w-full border-t border-[#0e0e0c]/10 bg-[#f5f2ec] py-16 sm:py-20"
      style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
    >
      <div className="mx-auto max-w-[1312px] px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[#0e0e0c]/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#63615b]">
              Caldren Architectural Schedule
            </p>
            <h2 className="mt-2 text-[28px] font-normal tracking-[-0.03em] text-[#0e0e0c] sm:text-[36px]">
              {title}
            </h2>
          </div>
          <p className="max-w-md text-[13px] leading-[1.55] text-[#63615b]">{subtitle}</p>
        </div>

        {/* 12-Column Split: Schedule Table Left (7 cols) + Floorplan Schematic Right (5 cols) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Interactive Schedule Table */}
          <div className="overflow-x-auto bg-white p-4 shadow-[0_8px_30px_rgba(14,14,12,0.04)] sm:p-6 lg:col-span-7">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#0e0e0c]/10 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#94918a]">
                  <th className="py-3 pr-3">Unit</th>
                  <th className="py-3 px-2">Layout</th>
                  <th className="hidden py-3 px-2 sm:table-cell">Floor</th>
                  <th className="py-3 px-2">Area</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 pl-2 text-right">Guide Price</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => {
                  const isSelected = selectedUnit.unit === u.unit;
                  const statusColor =
                    u.status === "Available"
                      ? "#2f7a4d"
                      : u.status === "Reserved"
                        ? "#b88428"
                        : "#94918a";

                  return (
                    <tr
                      key={u.unit}
                      onClick={() => handleRowClick(u)}
                      className={`cursor-pointer border-b border-[#0e0e0c]/8 transition-colors ${
                        isSelected ? "bg-[#0e0e0c]/[0.05]" : "hover:bg-[#0e0e0c]/[0.02]"
                      }`}
                    >
                      <td className="py-4 pr-3 text-[13.5px] font-semibold text-[#0e0e0c]">
                        {u.unit}
                      </td>
                      <td className="py-4 px-2 text-[13px] text-[#63615b]">{u.beds}</td>
                      <td className="hidden py-4 px-2 text-[13px] text-[#63615b] sm:table-cell">
                        Fl. {u.floor}
                      </td>
                      <td className="py-4 px-2 text-[13px] text-[#0e0e0c]">{u.area}</td>
                      <td
                        className="py-4 px-2 text-[12px] font-medium"
                        style={{ color: statusColor }}
                      >
                        <span
                          className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                          style={{ backgroundColor: statusColor }}
                        />
                        {u.status}
                      </td>
                      <td className="py-4 pl-2 text-right text-[13.5px] font-medium text-[#0e0e0c]">
                        {u.price}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Column: Live Floorplan Schematic Preview */}
          <div className="border border-[#0e0e0c]/10 bg-white p-6 shadow-[0_8px_30px_rgba(14,14,12,0.04)] sm:p-8 lg:col-span-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94918a]">
                  Floorplan Schematic
                </span>
                <h3 className="mt-1 text-2xl font-medium tracking-[-0.03em] text-[#0e0e0c]">
                  Residence {selectedUnit.unit}
                </h3>
              </div>
              <span className="rounded-full bg-[#0e0e0c] px-3.5 py-1 text-[11px] font-medium text-white">
                {selectedUnit.beds}
              </span>
            </div>

            {/* Architectural Blueprint SVG */}
            <div className="my-6 flex h-[220px] items-center justify-center border border-[#0e0e0c]/10 bg-[#f5f2ec]/60 p-4">
              <svg
                width="260"
                height="170"
                viewBox="0 0 260 170"
                fill="none"
                stroke="#0e0e0c"
                strokeWidth="1.25"
              >
                <rect x="14" y="14" width="232" height="142" strokeWidth="2" />
                <line x1="115" y1="14" x2="115" y2="156" />
                <line x1="115" y1="88" x2="246" y2="88" />
                <line x1="14" y1="98" x2="78" y2="98" />
                <path d="M 78 98 A 22 22 0 0 1 100 120" strokeDasharray="3 3" />
                <rect x="28" y="28" width="68" height="44" strokeOpacity="0.35" />
                <rect x="134" y="28" width="94" height="42" strokeOpacity="0.35" />
                <text x="34" y="54" fontSize="8" fill="#63615b" stroke="none">
                  LIVING SALON
                </text>
                <text x="144" y="53" fontSize="8" fill="#63615b" stroke="none">
                  PRINCIPAL SUITE
                </text>
                <text x="144" y="125" fontSize="8" fill="#63615b" stroke="none">
                  PANORAMIC TERRACE ({selectedUnit.area})
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#0e0e0c]/10 pt-5 text-[12.5px]">
              <div>
                <div className="text-[#94918a]">Total Area</div>
                <div className="mt-0.5 font-semibold text-[#0e0e0c]">{selectedUnit.area}</div>
              </div>
              <div>
                <div className="text-[#94918a]">Orientation</div>
                <div className="mt-0.5 font-semibold text-[#0e0e0c]">{selectedUnit.aspect}</div>
              </div>
              <div>
                <div className="text-[#94918a]">Floor Level</div>
                <div className="mt-0.5 font-semibold text-[#0e0e0c]">
                  Level {selectedUnit.floor}
                </div>
              </div>
              <div>
                <div className="text-[#94918a]">Guide Price</div>
                <div className="mt-0.5 font-semibold text-[#0e0e0c]">{selectedUnit.price}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0e0e0c] py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-white no-underline transition-opacity hover:opacity-90"
              >
                <span>Request Unit Dossier</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaldrenDevelopmentTable;
