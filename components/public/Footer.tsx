import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

type FooterProps = {
  phone: string;
  address: string;
  copyright: string;
};

export default function Footer({ phone, address, copyright }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <Image
            src="/footer-icon.png"
            alt={`${SITE_NAME} 아이콘`}
            width={280}
            height={280}
            className="footer-icon"
          />
          <Image
            src="/footer-text.svg"
            alt={SITE_NAME}
            width={350}
            height={350}
            className="footer-text"
          />
        </div>
        <div className="footer-info">
          <div className="contact-info">
            <p>{phone}</p>
            <p>{address}</p>
          </div>
          <p className="copyright">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
