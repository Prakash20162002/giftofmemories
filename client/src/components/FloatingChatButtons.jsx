"use client";
import React from "react";
import { MessageCircle, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const FloatingChatButtons = () => {
  const whatsappNumber = "918335934679";
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in your photography services!",
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { id: 1, text: "Hi! How can I help you?", sender: "bot" },
  ]);
  const [inputText, setInputText] = React.useState("");
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate bot response
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: "🚧 Oops! Hold tight! We’re working on this feature.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    // Pushed closer to the edge on mobile (right-4) to maximize screen space
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col gap-3 md:gap-4 items-end pointer-events-none">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            // Responsive sizing: adapts to phone width, respects keyboard height limit
            className="w-[calc(100vw-2rem)] sm:w-80 h-[400px] max-h-[60vh] md:max-h-[80vh] bg-warm-ivory border border-gold-accent/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-2 origin-bottom-right pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-charcoal-black p-3 md:p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-warm-ivory font-playfair font-medium text-sm md:text-base">
                  Gift of Memories Bot
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-warm-ivory/60 hover:text-warm-ivory transition-colors p-1"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/50 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-[13px] md:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-charcoal-black text-warm-ivory rounded-tr-none"
                        : "bg-white border border-gold-accent/20 text-charcoal-black rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 md:p-3 bg-white border-t border-gold-accent/10 shrink-0"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  // CRITICAL FIX: text-base prevents iOS Safari auto-zoom bug
                  className="flex-1 bg-warm-ivory/50 border border-gold-accent/10 rounded-full px-4 py-2 text-base md:text-sm focus:outline-none focus:border-gold-accent/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 md:w-9 md:h-9 bg-gold-accent text-charcoal-black rounded-full flex items-center justify-center shrink-0 hover:bg-gold-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons wrapper requires pointer-events-auto because parent is pointer-events-none */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Custom Bot Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 md:w-14 md:h-14 bg-charcoal-black text-gold-accent rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-xl transition-shadow border border-gold-accent/40 cursor-pointer self-end"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Chatbot"
        >
          <Bot size={24} strokeWidth={1.5} className="md:w-7 md:h-7" />
        </motion.button>

        {/* WhatsApp Button */}
        <motion.a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl transition-shadow self-end"
          aria-label="Chat on WhatsApp"
        >
          <IconBrandWhatsapp size={26} strokeWidth={2} className="md:w-[30px] md:h-[30px]" />
        </motion.a>
      </div>
      
    </div>
  );
};

export default FloatingChatButtons;