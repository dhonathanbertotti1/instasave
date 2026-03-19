"use client";

import { useState } from "react";

const faqs = [
  {
    question: "O InstaDownloader é gratuito?",
    answer: "Sim, o InstaDownloader é completamente gratuito. Sem taxas ocultas, sem assinatura e sem necessidade de cadastro.",
  },
  {
    question: "Preciso fazer login no Instagram para baixar conteúdo?",
    answer: "Não. Você não precisa fazer login no Instagram nem criar nenhuma conta. Basta colar o link de um post público e baixar na hora.",
  },
  {
    question: "Quais tipos de conteúdo do Instagram posso baixar?",
    answer: "Você pode baixar vídeos, reels, stories, fotos, carrosséis (várias imagens/vídeos) e vídeos do IGTV — desde que sejam de perfis públicos.",
  },
  {
    question: "Posso baixar vídeos de contas privadas?",
    answer: "Não. O InstaDownloader funciona apenas com conteúdo público. Contas e posts privados exigem a permissão do dono da conta para serem visualizados.",
  },
  {
    question: "Em qual qualidade os vídeos são baixados?",
    answer: "Os vídeos são baixados na maior qualidade disponível no Instagram, geralmente até 1080p. A qualidade depende do que foi enviado originalmente.",
  },
  {
    question: "É legal baixar vídeos do Instagram?",
    answer: "Baixar conteúdo do Instagram para uso pessoal e offline é geralmente aceito. No entanto, você não deve redistribuir ou usar o conteúdo baixado comercialmente sem a permissão do criador. Sempre respeite os direitos autorais e os criadores de conteúdo.",
  },
  {
    question: "Por que não consigo baixar um post específico?",
    answer: "Alguns posts podem falhar por restrições do Instagram, configurações de conta privada ou limitação temporária de requisições. Certifique-se de que a conta é pública e tente novamente em alguns minutos.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-400">
            Tudo o que você precisa saber sobre o InstaDownloader.
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
