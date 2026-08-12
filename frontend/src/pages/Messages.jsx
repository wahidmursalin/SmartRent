import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageSquare, Home as HomeIcon } from "lucide-react";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

  const [activeId, setActiveId] = useState(searchParams.get("conversation") || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const { data } = await api.getConversations();
      setConversations(data);
      // Auto-select first conversation if none chosen yet
      if (!activeId && data.length > 0) {
        setActiveId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setSearchParams({ conversation: activeId });

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.getMessages(activeId);
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;

    setSending(true);
    try {
      const { data } = await api.sendMessage(activeId, text.trim());
      setMessages((prev) => [...prev, data]);
      setText("");
      fetchConversations(); // refresh last message preview in the list
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) =>
    conv.participants.find((p) => p._id !== user._id) || conv.participants[0];

  const activeConversation = conversations.find((c) => c._id === activeId);

  if (loadingConvos) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row h-[600px]">
        {/* Conversation list */}
        <div className="sm:w-72 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-y-auto flex-shrink-0">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <MessageSquare size={28} className="mx-auto mb-2 text-gray-300" />
              No conversations yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = conv._id === activeId;
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveId(conv._id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                    isActive ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate">{other?.name}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-brand-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.house?.title && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                      <HomeIcon size={11} /> {conv.house.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-gray-800 text-sm">
                  {getOtherParticipant(activeConversation)?.name}
                </p>
                {activeConversation.house?.title && (
                  <p className="text-xs text-gray-400">Re: {activeConversation.house.title}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {loadingMessages ? (
                  <Loading />
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm mt-8">
                    Say hello to start the conversation.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender._id === user._id;
                    return (
                      <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                            isMine
                              ? "bg-brand-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
