import { Bus, MapPin, TrainFront } from "lucide-react";

type Props = {
  settings: Record<string, string>;
  title?: string;
};

export default function LocationSection({ settings, title }: Props) {
  return (
    <section className="location-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="map-container">
        <a
          href={settings.naver_map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="map-link"
        >
          <MapPin aria-hidden /> 네이버 지도에서 위치 보기
        </a>
      </div>
      <div className="location-info">
        <div className="address">
          <h3>주소</h3>
          <p>
            <MapPin aria-hidden /> {settings.address}
          </p>
        </div>
        <div className="directions">
          <h3>교통편</h3>
          <p>
            <TrainFront aria-hidden /> {settings.subway}
          </p>
          <p>
            <Bus aria-hidden /> {settings.bus}
          </p>
        </div>
      </div>
    </section>
  );
}
