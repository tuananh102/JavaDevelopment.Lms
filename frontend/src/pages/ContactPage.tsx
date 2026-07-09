import { useState } from "react";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";

const CONTACTS = [
  { icon: Mail, label: "Email", value: "support@lms-platform.example" },
  { icon: Phone, label: "Phone", value: "(+84) 28 3896 8641" },
  {
    icon: MapPin,
    label: "Address",
    value: "1 Vo Van Ngan, Thu Duc, Ho Chi Minh City",
  },
];

const inputCls =
  "w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function ContactPage() {
  usePageTitle("Contact Us");
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-2 text-slate-600">
          Have a question about a course, or want to become an instructor?
          Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CONTACTS.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center text-slate-500 text-sm">
              <Icon className="w-4 h-4 mr-2 text-primary-600" />
              {label}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900 break-words">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {sent ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-success-600 mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Message sent!
            </h2>
            <p className="mt-2 text-slate-600">
              Thanks for reaching out — we'll get back to you soon.
            </p>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              // Demo form — no messaging backend yet; just acknowledge locally.
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your name
                </label>
                <input type="text" required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input type="email" required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea required rows={5} className={inputCls} />
            </div>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-4 py-2"
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
