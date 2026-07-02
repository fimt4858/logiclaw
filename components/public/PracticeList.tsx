import Image from "next/image";
import { splitParagraphs } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import type { PracticeArea } from "@/lib/types";

export default function PracticeList({ areas }: { areas: PracticeArea[] }) {
  return (
    <section className="practice-area-section">
      {areas.map((area) => (
        <div key={area.id} className="practice-item">
          <div className="practice-header">
            <h3>{area.title}</h3>
          </div>
          <div className="practice-content">
            {area.image_path && (
              <div className="practice-image">
                <Image
                  src={publicImageUrl(area.image_path)}
                  alt={area.title}
                  width={500}
                  height={340}
                  sizes="(max-width: 768px) 100vw, 250px"
                />
              </div>
            )}
            <div className="practice-text">
              {splitParagraphs(area.body).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
