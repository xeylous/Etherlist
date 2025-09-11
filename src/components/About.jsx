import React from "react";

export default function About() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">
        About Etherlist
      </h2>
      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
        Etherlist is a decentralized to-do app powered by{" "}
        <span className="text-pink-400 font-semibold">Ethereum</span>. 
        Your tasks are securely stored on the blockchain, ensuring 
        transparency and ownership. Connect your wallet, add tasks, 
        and track your progress — all without a centralized server. 🚀
      </p>
    </section>
  );
}
