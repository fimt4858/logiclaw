import { Icon } from "@/lib/icons";
import type { CoreValue } from "@/lib/types";

export default function CoreValues({ values }: { values: CoreValue[] }) {
  if (values.length === 0) return null;

  return (
    <section className="core-values">
      <h2 className="section-title">핵심 가치</h2>
      <div className="values-grid">
        {values.map((value) => (
          <div key={value.id} className="value-card">
            <div className="value-icon">
              <Icon name={value.icon} />
            </div>
            <h4>{value.title}</h4>
            <p>{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
