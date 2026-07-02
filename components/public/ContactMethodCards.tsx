import { Icon } from "@/lib/icons";
import type { ContactMethod } from "@/lib/types";

type Props = {
  methods: ContactMethod[];
  showTitle?: boolean;
};

export default function ContactMethodCards({ methods, showTitle }: Props) {
  if (methods.length === 0) return null;

  return (
    <section className="contact-info-section">
      {showTitle && <h2 className="section-title">상담예약</h2>}
      <div className="contact-methods">
        {methods.map((method) => (
          <div key={method.id} className="contact-card">
            <div className="card-icon">
              <Icon name={method.icon} />
            </div>
            <h3>{method.title}</h3>
            <p>{method.description}</p>
            {method.button_url ? (
              <a
                href={method.button_url}
                className="contact-button"
                {...(method.button_url.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {method.button_label}
              </a>
            ) : (
              <span className="contact-button disabled">
                {method.button_label}(준비중)
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
