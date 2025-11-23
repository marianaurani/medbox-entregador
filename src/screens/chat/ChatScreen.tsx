// src/screens/chat/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useChat, ChatType, Message } from '../../contexts/ChatContext';
import colors from '../../constants/colors';

type RouteParams = {
  chatType: ChatType;
  chatName: string;
  deliveryId?: string;
};

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatType, chatName, deliveryId } = route.params as RouteParams;
  const { getMessagesByChat, sendMessage, markAsRead } = useChat();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ CORRIGIDO - Carrega mensagens ao entrar na tela
  useFocusEffect(
    React.useCallback(() => {
      loadMessages();
      markAsRead(chatType, deliveryId);
      
      // Atualiza mensagens a cada 500ms enquanto está na tela
      intervalRef.current = setInterval(() => {
        loadMessages();
      }, 500);

      // Limpa o intervalo ao sair da tela
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [chatType, deliveryId])
  );

  const loadMessages = () => {
    const chatMessages = getMessagesByChat(chatType, deliveryId);
    setMessages(chatMessages);
  };

  // ✅ CORRIGIDO - Rola para o final quando mensagens mudam
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const text = inputText.trim();
    setInputText('');

    try {
      await sendMessage(text, chatType, deliveryId);
      // ✅ Atualiza imediatamente após enviar
      setTimeout(() => {
        loadMessages();
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageStatus = (status: Message['status']) => {
    if (status === 'sending') {
      return <Ionicons name="time-outline" size={14} color={colors.textLight} />;
    }
    if (status === 'sent') {
      return <Ionicons name="checkmark" size={14} color={colors.textLight} />;
    }
    if (status === 'delivered') {
      return <Ionicons name="checkmark-done" size={14} color={colors.textLight} />;
    }
    if (status === 'read') {
      return <Ionicons name="checkmark-done" size={14} color={colors.info} />;
    }
    return null;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.otherText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isUser ? styles.userTime : styles.otherTime]}>
              {formatTime(item.timestamp)}
            </Text>
            {isUser && renderMessageStatus(item.status)}
          </View>
        </View>
      </View>
    );
  };

  const getChatIcon = () => {
    switch (chatType) {
      case 'support':
        return 'headset-outline';
      case 'customer':
        return 'person-outline';
      case 'pharmacy':
        return 'storefront-outline';
      default:
        return 'chatbubble-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name={getChatIcon()} size={22} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{chatName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Inicie uma conversa</Text>
            <Text style={styles.emptySubtext}>
              {chatType === 'support' 
                ? 'Nossa equipe está pronta para ajudar!' 
                : 'Envie uma mensagem para começar'}
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  otherText: {
    color: colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  inputContainer: {
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.5,
  },
});

export default ChatScreen;