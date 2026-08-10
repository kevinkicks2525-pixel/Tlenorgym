import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

const galleryItems = [
  {
    src: "/images/dumbbell-rack.jpg",
    alt: "Rangée d'haltères TechnoGym",
    label: "Musculation",
    tall: true,
  },
  {
    src: "/images/machines-1.jpg",
    alt: "Machines de musculation",
    label: "Machines",
    tall: false,
  },
  {
    src: "/images/cardio-zone.jpg",
    alt: "Zone cardio",
    label: "Cardio",
    tall: false,
  },
  {
    src: "/images/studio-boxing.jpg",
    alt: "Studio de boxe",
    label: "Studio",
    tall: false,
  },
  {
    src: "/images/machines-2.jpg",
    alt: "Équipement de musculation",
    label: "Équipement",
    tall: false,
  },
];

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="container">
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            <span className="section-label">Notre Salle</span>
            <h2 className="section-title">
              Un espace pensé pour la <span className="text-accent">performance</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="gallery__grid">
          {galleryItems.map((item, i) => (
            <div key={i} className={`gallery__item ${item.tall ? "gallery__item--tall" : ""}`}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <div className="gallery__item-overlay">
                <span className="gallery__item-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
