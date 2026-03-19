"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is InstaDownloader free to use?",
    answer: "Yes, InstaDownloader is completely free to use. There are no hidden fees, no subscriptions, and no sign-up required.",
  },
  {
    question: "Do I need to log in to Instagram to download content?",
    answer: "No, you don't need to log in to Instagram or create any account. Simply paste the link of a public Instagram post and download it instantly.",
  },
  {
    question: "What types of Instagram content can I download?",
    answer: "You can download Instagram videos, reels, stories, photos, carousel posts (multiple images/videos), and IGTV videos — as long as they are from public accounts.",
  },
  {
    question: "Can I download private Instagram videos?",
    answer: "No. InstaDownloader only works with public Instagram content. Private accounts and posts require the account holder's permission to view.",
  },
  {
    question: "In what quality are the videos downloaded?",
    answer: "Videos are downloaded in the highest quality available from Instagram, usually up to 1080p. The quality depends on what was originally uploaded.",
  },
  {
    question: "Is it legal to download Instagram videos?",
    answer: "Downloading Instagram content for personal, offline viewing is generally accepted. However, you should not redistribute or use downloaded content commercially without the creator's permission. Always respect copyright and content creators.",
  },
  {
    question: "Why can't I download a specific post?",
    answer: "Some posts may fail to download due to Instagram's restrictions, private account settings, or temporary rate limiting. Make sure the account is public and try again in a few minutes.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Everything you need to know about InstaDownloader.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed fade-in border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
