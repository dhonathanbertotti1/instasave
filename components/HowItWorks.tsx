export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: "Copy the Instagram link",
      description: "Open Instagram and copy the link of the post, reel, story, or photo you want to download.",
    },
    {
      number: "02",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Paste the link",
      description: "Paste the copied link into the input field above and click the Download button.",
    },
    {
      number: "03",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      title: "Download your media",
      description: "Click the download button to save the video, photo, reel, or story directly to your device.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How to Download Instagram Media
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Download any public Instagram content in just 3 simple steps. No registration required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-4 right-4 text-5xl font-black text-white/5 select-none">
                {step.number}
              </div>

              <div className="w-12 h-12 rounded-xl instagram-gradient flex items-center justify-center mb-4 text-white">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
