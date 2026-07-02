// DB row 타입

export type ProfileItem = {
  period?: string;
  text: string;
};

export type SiteSetting = {
  key: string;
  value: string;
  label: string;
};

export type PageHero = {
  slug: string;
  hero_title: string;
  hero_subtitle: string;
};

export type CoreValue = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  published: boolean;
};

export type PracticeArea = {
  id: string;
  title: string;
  image_path: string;
  body: string;
  sort_order: number;
  published: boolean;
};

export type StaffMember = {
  id: string;
  name: string;
  title: string;
  photo_path: string;
  education: ProfileItem[];
  career: ProfileItem[];
  certifications: ProfileItem[];
  introduction: string;
  sort_order: number;
  published: boolean;
};

export type ContactMethod = {
  id: string;
  icon: string;
  title: string;
  description: string;
  button_label: string;
  button_url: string;
  sort_order: number;
  published: boolean;
};

export type ConsultationStatus = "new" | "in_progress" | "done";

export type ConsultationRequest = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: ConsultationStatus;
  memo: string;
  created_at: string;
};
