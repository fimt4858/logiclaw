import Image from "next/image";
import { splitParagraphs } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import type { ProfileItem, StaffMember } from "@/lib/types";

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: ProfileItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="profile-section">
      <h3 className="profile-title">{title}</h3>
      <ul className="profile-list">
        {items.map((item, i) => (
          <li key={i}>
            {item.period && <span className="profile-year">{item.period}</span>}
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div className="staff-card">
      <div className="staff-top">
        {member.photo_path && (
          <div className="staff-image">
            <Image
              src={publicImageUrl(member.photo_path)}
              alt={`${member.name} ${member.title}`}
              width={500}
              height={750}
              sizes="(max-width: 768px) 250px, 400px"
            />
          </div>
        )}
        <div className="staff-info">
          <h2>
            {member.name} {member.title}
          </h2>
          <div className="profile-details">
            <ProfileSection title="학력" items={member.education} />
            <ProfileSection title="주요 경력" items={member.career} />
            <ProfileSection title="자격" items={member.certifications} />
          </div>
        </div>
      </div>
      {member.introduction && (
        <div className="introduction">
          <h3>소개</h3>
          {splitParagraphs(member.introduction).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}
