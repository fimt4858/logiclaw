"use client";

import { useActionState } from "react";
import { submitConsultation, type FormState } from "@/lib/actions/consultation";

export default function ConsultationForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitConsultation,
    null
  );

  return (
    <section className="contact-info-section">
      <div className="contact-form">
        <h2>온라인 상담 신청</h2>
        {state?.ok ? (
          <p className="form-message success">{state.message}</p>
        ) : (
          <form action={formAction}>
            <div className="form-group">
              <label htmlFor="name">성함</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={50}
                placeholder="홍길동"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">연락처</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">상담 내용</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                maxLength={2000}
                placeholder="상담을 원하시는 내용을 간략히 적어 주세요."
              />
            </div>
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="website">
                이 필드는 비워 두세요
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>
            <button type="submit" className="submit-button" disabled={pending}>
              {pending ? "접수 중..." : "상담 신청하기"}
            </button>
            {state && !state.ok && (
              <p className="form-message error">{state.message}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
