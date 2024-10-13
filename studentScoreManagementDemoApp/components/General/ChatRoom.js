import React, { useState, useEffect, useCallback, useRef } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, database } from "../../configs/Firebase";

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const unsubscribeRef = useRef(null); // Track subscription for cleanup

  // Fetch messages and subscribe to changes
  useEffect(() => {
    const collectionRef = collection(database, "rooms", roomId, "messages");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    unsubscribeRef.current = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });

    // Cleanup listener when the component unmounts
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [roomId]);

  // Send new message to Firebase
  const onSend = useCallback(
    async (messages = []) => {
      if (!messages.length) return; // Prevent sending empty messages

      const { _id, createdAt, text, user } = messages[0];
      try {
        await addDoc(collection(database, "rooms", roomId, "messages"), {
          _id,
          createdAt,
          text,
          user,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [roomId]
  );

  // Current user's info
  const currentUser = {
    _id: auth.currentUser?.uid || "",
    name: auth.currentUser?.email || "Anonymous",
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={currentUser}
      messagesContainerStyle={{ backgroundColor: "#000" }}
      textInputStyle={{
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 10,
      }}
      placeholder="Type a message..."
      alwaysShowSend={true} // Show send button even if the input is empty
    />
  );
};

export default ChatRoom;
