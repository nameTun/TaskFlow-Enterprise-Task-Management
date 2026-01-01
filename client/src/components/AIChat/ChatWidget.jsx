import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Avatar, Spin, Tooltip, Tag } from "antd";
import { Send, X, Bot, User, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import aiService from "../../services/ai.service";
import { useAuth } from "../../context/Auth/Auth.context";

const SUGGESTED_PROMPTS = [
  "Danh sách task của tôi",
  "Thống kê hệ thống",
  "Tạo task 'Họp team' vào ngày mai",
  "Task nào đang ưu tiên cao?",
];

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Khởi tạo tin nhắn chào mừng
  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([
        {
          role: "model",
          text: `Chào **${user.name}**! 👋\nTôi là **TaskFlow AI**. Tôi có thể giúp bạn quản lý công việc, tra cứu dữ liệu hoặc tạo task mới.\n\n*Bạn cần tôi giúp gì hôm nay?*`,
        },
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const handleSend = async (text = null) => {
    const msgToSend = text || inputValue;
    if (!msgToSend.trim()) return;

    setInputValue("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: msgToSend }]);
    setIsThinking(true);

    try {
      const res = await aiService.chat(msgToSend);
      const aiReply = res.metadata.reply;

      setMessages((prev) => [...prev, { role: "model", text: aiReply }]);
    } catch (error) {
      console.error("Chat Widget Error:", error);
      const errorText =
        error.response?.data?.message ||
        "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";
      setMessages((prev) => [...prev, { role: "model", text: errorText }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-[#1f1f1f] w-[380px] h-[550px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 mb-4 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">TaskFlow Assistant</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1 opacity-90">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Powered by Gemini 2.5
                </span>
              </div>
            </div>
            <Button
              type="text"
              icon={<X size={20} className="text-white" />}
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full"
            />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50 dark:bg-[#141414]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  size="small"
                  icon={
                    msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )
                  }
                  className={`mt-1 shrink-0 ${
                    msg.role === "user" ? "bg-indigo-600" : "bg-blue-500"
                  }`}
                  src={msg.role === "user" ? user?.avatar : null}
                />
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-[#2a2a2a] dark:text-gray-200 text-gray-800 rounded-tl-none border border-gray-100 dark:border-gray-700"
                  }`}
                >
                  {msg.role === "model" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc ml-4 space-y-1 my-2"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal ml-4 space-y-1 my-2"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="my-0.5" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <span
                              className="font-bold text-blue-600 dark:text-blue-400"
                              {...props}
                            />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code
                                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-red-500"
                                {...props}
                              />
                            ) : (
                              <div className="bg-gray-800 text-gray-100 p-2 rounded-lg text-xs overflow-x-auto my-2">
                                <code {...props} />
                              </div>
                            ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3">
                <Avatar
                  size="small"
                  icon={<Bot size={14} />}
                  className="bg-blue-500 mt-1"
                />
                <div className="bg-white dark:bg-[#2a2a2a] p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex items-center gap-1.5 shadow-sm">
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts (Chỉ hiện khi chưa có nhiều tin nhắn) */}
          {messages.length < 3 && !isThinking && (
            <div className="px-4 pb-2 bg-gray-50 dark:bg-[#141414] overflow-x-auto whitespace-nowrap scrollbar-hide">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="inline-flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-white dark:bg-[#2a2a2a] border border-blue-100 dark:border-gray-700 rounded-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors shadow-sm mb-1"
                >
                  <Zap size={12} className="fill-blue-600" /> {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#1f1f1f] border-t border-gray-100 dark:border-gray-800">
            <div className="relative flex items-end gap-2">
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="!rounded-2xl !bg-gray-50 dark:!bg-[#2a2a2a] dark:!text-white dark:!border-gray-700 !pr-10 !py-2.5 !resize-none"
                disabled={isThinking}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<Send size={18} className="ml-0.5" />}
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isThinking}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-lg shadow-blue-500/30 h-10 w-10 flex items-center justify-center"
              />
            </div>
            <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">
              AI Agent can access your tasks & data
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Tooltip title="Chat with AI" placement="left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${
            isOpen
              ? "bg-gray-600 rotate-90"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 animate-bounce-slow"
          }`}
        >
          {isOpen ? (
            <X color="white" size={24} />
          ) : (
            <Sparkles color="white" size={24} />
          )}
        </button>
      </Tooltip>
    </div>
  );
};

export default ChatWidget;
