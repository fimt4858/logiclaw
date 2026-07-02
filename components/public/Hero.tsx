import Image from "next/image";
import { renderEmphasis } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import ScrollArrow from "./ScrollArrow";

type HeroProps = {
  title: string;
  subtitle?: string;
  imagePath?: string;
  fullscreen?: boolean;
};

// 홈: fullscreen(배너 문구 + 스크롤 화살표), 서브 페이지: 제목 + 부제
export default function Hero({
  title,
  subtitle,
  imagePath,
  fullscreen = false,
}: HeroProps) {
  const imageUrl = imagePath ? publicImageUrl(imagePath) : "";

  return (
    <section
      className={`hero-section${fullscreen ? " hero-section--fullscreen" : ""}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={fullscreen}
          sizes="100vw"
          className="hero-bg"
        />
      )}
      <div className="hero-overlay" />
      {fullscreen ? (
        <>
          <div className="banner-content">
            <p className="banner-text">{renderEmphasis(title)}</p>
          </div>
          <ScrollArrow />
        </>
      ) : (
        <>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </>
      )}
    </section>
  );
}
