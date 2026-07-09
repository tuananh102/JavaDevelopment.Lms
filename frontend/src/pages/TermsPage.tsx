import { usePageTitle } from "../hooks/usePageTitle";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Acceptance of terms",
    body: "By creating an account or using LMS Platform, you agree to these Terms & Conditions. If you do not agree, please do not use the platform. LMS Platform is a student project built for the HCMUTE Web Development course and is provided for educational purposes.",
  },
  {
    title: "2. Accounts",
    body: "You are responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information when registering. Administrators may deactivate accounts that violate these terms.",
  },
  {
    title: "3. Courses and enrollment",
    body: "Free courses can be enrolled in directly. Paid courses require completing the checkout flow before enrollment. Payments on this platform are simulated for demonstration purposes — no real money is charged.",
  },
  {
    title: "4. Instructor content",
    body: "Instructors retain ownership of the course content they create, and grant LMS Platform the right to display it to enrolled students. Instructors are responsible for ensuring their content does not infringe any third-party rights.",
  },
  {
    title: "5. Acceptable use",
    body: "You may not share, resell, or redistribute course content, attempt to access courses you are not enrolled in, or interfere with the operation of the platform.",
  },
  {
    title: "6. Changes to these terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the new terms.",
  },
];

export default function TermsPage() {
  usePageTitle("Terms & Conditions");

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
