"use client";

import { useState, useTransition } from "react";
import SaveBar from "./SaveBar";
import {
  savePages,
  saveSettings,
  type ActionResult,
} from "@/lib/actions/content";
import type { PageHero, SiteSetting } from "@/lib/types";

const PAGE_LABELS: Record<string, string> = {
  "practice-areas": "업무분야",
  staff: "구성원",
  location: "오시는 길",
  contact: "상담예약",
};

type Props = {
  settings: SiteSetting[];
  pages: PageHero[];
};

export default function SettingsEditor(props: Props) {
  // banner_image_path는 홈 화면 메뉴에서 관리하므로 여기서는 제외
  const [settings, setSettings] = useState(
    props.settings.filter((s) => s.key !== "banner_image_path")
  );
  const [pages, setPages] = useState(
    props.pages.filter((p) => p.slug !== "home")
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const settingsResult = await saveSettings(
            settings.map(({ key, value }) => ({ key, value }))
          );
          if (!settingsResult.ok) {
            setResult(settingsResult);
            return;
          }
          setResult(await savePages(pages));
        });
      }}
    >
      <div className="admin-section">
        <h2>연락처·기본 정보</h2>
        {settings.map((setting, index) => (
          <div key={setting.key} className="admin-field">
            <label htmlFor={`setting-${setting.key}`}>{setting.label}</label>
            <input
              id={`setting-${setting.key}`}
              type="text"
              value={setting.value}
              onChange={(e) =>
                setSettings(
                  settings.map((s, i) =>
                    i === index ? { ...s, value: e.target.value } : s
                  )
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>페이지 상단 문구</h2>
        {pages.map((page, index) => (
          <div key={page.slug} className="admin-field">
            <label>{PAGE_LABELS[page.slug] ?? page.slug}</label>
            <div className="admin-row">
              <input
                type="text"
                value={page.hero_title}
                placeholder="제목"
                onChange={(e) =>
                  setPages(
                    pages.map((p, i) =>
                      i === index ? { ...p, hero_title: e.target.value } : p
                    )
                  )
                }
              />
              <input
                type="text"
                value={page.hero_subtitle}
                placeholder="부제"
                style={{ flex: 2 }}
                onChange={(e) =>
                  setPages(
                    pages.map((p, i) =>
                      i === index ? { ...p, hero_subtitle: e.target.value } : p
                    )
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <SaveBar pending={pending} result={result} />
    </form>
  );
}
