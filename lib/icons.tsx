import {
  Brain,
  Bus,
  Clock,
  FileText,
  Gavel,
  Handshake,
  Landmark,
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  TrainFront,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

// DB의 icon 컬럼 값 → 아이콘 컴포넌트.
// 어드민에서는 이 목록에서만 선택할 수 있다.
export const ICON_MAP: Record<string, LucideIcon> = {
  scale: Scale,
  brain: Brain,
  zap: Zap,
  handshake: Handshake,
  phone: Phone,
  laptop: Laptop,
  "message-circle": MessageCircle,
  "map-pin": MapPin,
  gavel: Gavel,
  landmark: Landmark,
  users: Users,
  clock: Clock,
  "file-text": FileText,
  "train-front": TrainFront,
  bus: Bus,
};

export const ICON_LABELS: Record<string, string> = {
  scale: "저울",
  brain: "두뇌",
  zap: "번개",
  handshake: "악수",
  phone: "전화",
  laptop: "노트북",
  "message-circle": "말풍선",
  "map-pin": "지도 핀",
  gavel: "법봉",
  landmark: "관공서",
  users: "사람들",
  clock: "시계",
  "file-text": "문서",
  "train-front": "지하철",
  bus: "버스",
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICON_MAP[name] ?? Scale;
  return <Cmp className={className} aria-hidden />;
}
