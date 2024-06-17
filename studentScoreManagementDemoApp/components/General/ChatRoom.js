import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../../configs/Firebase';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const collectionRef = collection(database, 'rooms', roomId, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, querySnapshot => {
      setMessages(
        querySnapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });

    return unsubscribe;
  }, [roomId]);

  const onSend = useCallback((messages = []) => {
    const { _id, createdAt, text, user } = messages[0];

    if (auth.currentUser) {
      addDoc(collection(database, 'rooms', roomId, 'messages'), {
        _id,
        createdAt,
        text,
        user,
      });
    }
  }, [roomId]);

  return (
    <GiftedChat
      messages={messages}
      messagesContainerStyle={{
        backgroundColor: '#000'
      }}
        textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth.currentUser ? auth.currentUser.uid : '',
        name: auth.currentUser ? auth.currentUser.email : '',
      }}
    />
  );
};

export default ChatRoom;