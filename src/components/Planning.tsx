"use client";

import { useState } from "react";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { Calendar, Clock, User, Users, Eye, X } from "lucide-react";

interface TimeSlot {
  time: string;
  schedule: Record<string, "femme" | "mixte" | "ferme">;
}

const days = ["SAM", "DIM", "LUN", "MAR", "MER", "JEU", "VEN"];
const dayLabels: Record<string, string> = {
  SAM: "Samedi",
  DIM: "Dimanche",
  LUN: "Lundi",
  MAR: "Mardi",
  MER: "Mercredi",
  JEU: "Jeudi",
  VEN: "Vendredi",
};

const slots: TimeSlot[] = [
  {
    time: "08h30 - 11h30",
    schedule: { SAM: "femme", DIM: "mixte", LUN: "femme", MAR: "mixte", MER: "femme", JEU: "mixte", VEN: "ferme" },
  },
  {
    time: "11h30 - 13h30",
    schedule: { SAM: "femme", DIM: "mixte", LUN: "femme", MAR: "mixte", MER: "femme", JEU: "mixte", VEN: "ferme" },
  },
  {
    time: "13h30 - 14h30",
    schedule: { SAM: "femme", DIM: "femme", LUN: "femme", MAR: "femme", MER: "femme", JEU: "femme", VEN: "ferme" },
  },
  {
    time: "14h30 - 16h30",
    schedule: { SAM: "mixte", DIM: "femme", LUN: "mixte", MAR: "femme", MER: "mixte", JEU: "femme", VEN: "ferme" },
  },
  {
    time: "16h30 - 18h00",
    schedule: { SAM: "mixte", DIM: "mixte", LUN: "mixte", MAR: "mixte", MER: "mixte", JEU: "mixte", VEN: "ferme" },
  },
  {
    time: "18h00 - 19h30",
    schedule: { SAM: "mixte", DIM: "mixte", LUN: "mixte", MAR: "mixte", MER: "mixte", JEU: "mixte", VEN: "mixte" },
  },
  {
    time: "19h30 - 21h30",
    schedule: { SAM: "mixte", DIM: "mixte", LUN: "mixte", MAR: "mixte", MER: "mixte", JEU: "mixte", VEN: "mixte" },
  },
];

export default function Planning() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "femme" | "mixte">("all");

  return (
    <section className="section" id="planning" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
            <span className="section-label">Horaires & Planning</span>
            <h2 className="section-title">
              Planning des <span className="text-accent">Séances</span>
            </h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Consultez le planning hebdomadaire avec créneaux réservés aux Femmes et créneaux Cardio / Musculation Mixte.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <button
                className={`btn btn--sm ${selectedFilter === "all" ? "btn--primary" : "btn--outline"}`}
                onClick={() => setSelectedFilter("all")}
              >
                Tous les créneaux
              </button>
              <button
                className={`btn btn--sm ${selectedFilter === "femme" ? "btn--primary" : "btn--outline"}`}
                onClick={() => setSelectedFilter("femme")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <User size={16} /> Créneaux Femmes
              </button>
              <button
                className={`btn btn--sm ${selectedFilter === "mixte" ? "btn--primary" : "btn--outline"}`}
                onClick={() => setSelectedFilter("mixte")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Users size={16} /> Créneaux Mixte
              </button>

              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Eye size={16} /> Voir l&apos;Affiche Officielle
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Schedule Table */}
        <ScrollReveal>
          <div className="planning__table-wrapper" style={{ overflowX: "auto", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "rgba(245, 197, 24, 0.08)", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontFamily: "var(--font-heading)", color: "var(--color-accent)", fontWeight: 700 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <Clock size={18} /> Horaire
                    </span>
                  </th>
                  {days.map((day) => (
                    <th key={day} style={{ padding: "1rem", fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 700 }}>
                      <div>{day}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 400 }}>{dayLabels[day]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                      {slot.time}
                    </td>
                    {days.map((day) => {
                      const type = slot.schedule[day];
                      const isMatch = selectedFilter === "all" || selectedFilter === type;

                      return (
                        <td key={day} style={{ padding: "0.75rem", opacity: isMatch ? 1 : 0.25, transition: "opacity 0.2s ease" }}>
                          {type === "femme" && (
                            <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "20px", background: "rgba(230, 57, 70, 0.15)", color: "#ff6b6b", border: "1px solid rgba(230, 57, 70, 0.3)", fontSize: "0.8rem", fontWeight: 700 }}>
                              FEMME
                            </span>
                          )}
                          {type === "mixte" && (
                            <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "20px", background: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid rgba(245, 197, 24, 0.3)", fontSize: "0.8rem", fontWeight: 700 }}>
                              CTRM MIXTE
                            </span>
                          )}
                          {type === "ferme" && (
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>

      {/* Official Flyer Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div style={{ position: "relative", maxWidth: "800px", width: "100%", maxHeight: "90vh", borderRadius: "16px", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 10,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <img
              src="/images/planning-official.jpg"
              alt="Planning Officiel Tlénor Gym"
              style={{ width: "100%", height: "auto", maxHeight: "85vh", objectFit: "contain", borderRadius: "16px" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
