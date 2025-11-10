import { useEffect, useState } from "react";
import type { Message, RoomData } from "../../types/room";
import "./InGameChat.css";
import { IoMdChatbubbles } from "react-icons/io";
import { useAuth } from "../../providers/UserProvider";
import { toast } from "sonner";
import { database } from "../../auth/config";
import { doc, updateDoc } from "firebase/firestore";

type InGameChatProps = {
  roomData: RoomData;
  setRoomData: (data: RoomData) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
};

export function InGameChat({
  roomData,
  isChatOpen,
  setIsChatOpen,
  setRoomData,
}: InGameChatProps) {
  const { user } = useAuth();

  const [isNewMessage, setIsNewMessage] = useState(false); //TODO - implement new message detection

  useEffect(() => {
    if (!isChatOpen) {
      setIsNewMessage(true);
    }
  }, [roomData.chat]);

  const [messageInput, setMessageInput] = useState("");

  async function sendMessage(content: string) {
    if (!user) return;
    if (content.trim() === "") return toast.error("Message cannot be empty.");
    if (content.length > 500)
      return toast.error("Message cannot exceed 500 characters.");
    if (user.displayName === null || user.photoURL === null) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 10),
      sender: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      content,
      timestamp: new Date(),
    };

    try {
      const roomRef = doc(database, "rooms", roomData.id);
      // Update the room's chat array with the new message
      await updateDoc(roomRef, {
        chat: [...roomData.chat, newMessage],
      });
      //update local state
      setRoomData({
        ...roomData,
        chat: [...roomData.chat, newMessage],
      });

      setMessageInput("");
      setIsNewMessage(false);
    } catch (error) {
      console.error("Error sending message: ", error);
      toast.error("Failed to send message. Please try again.");
    }
  }

  function scrollToBottomOfChat() {
    const chatMessagesDiv = document.querySelector(
      ".chat__messages"
    ) as HTMLDivElement;
    if (chatMessagesDiv) {
      chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }
  }
  return (
    <>
      <button
        className="chat__icon"
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          setIsNewMessage(false);
        }}
      >
        <IoMdChatbubbles />
        {isNewMessage && <div className="chat__notification-dot" />}
      </button>

      {isChatOpen && (
        <div className="chat__content">
          <span>chat</span>
          {roomData.chat.length > 0 ? (
            <div className="chat__messages" onLoad={scrollToBottomOfChat}>
              {roomData.chat.map((message) => (
                <div
                  key={message.id}
                  className={`chat__message ${
                    message.sender.displayName === user?.displayName
                      ? "chat__message--own"
                      : "chat__message--other"
                  }`}
                >
                  <div
                    className={`chat__message-sender ${
                      message.sender.displayName === user?.displayName
                        ? "chat__message-sender--own"
                        : "chat__message-sender--other"
                    }`}
                  >
                    <img
                      src={message.sender.photoURL}
                      alt={message.sender.displayName}
                      className="chat__message-avatar"
                    />
                    {message.sender.displayName}
                  </div>
                  <p
                    className={`chat__message-content ${
                      message.sender.displayName === user?.displayName
                        ? "chat__message-content--own"
                        : "chat__message-content--other"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No messages yet.</p>
          )}
          <form
            className="chat__input-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(messageInput);
            }}
          >
            <input
              type="text"
              className="chat__input"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="submit" className="chat__send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
