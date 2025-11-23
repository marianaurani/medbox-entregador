// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatType = 'support' | 'customer' | 'pharmacy';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  status: MessageStatus;
  chatType: ChatType;
  deliveryId?: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  deliveryId?: string;
}

interface ChatContextData {
  chats: Chat[];
  messages: Message[];
  sendMessage: (text: string, chatType: ChatType, deliveryId?: string) => Promise<void>;
  getMessagesByChat: (chatType: ChatType, deliveryId?: string) => Message[];
  markAsRead: (chatType: ChatType, deliveryId?: string) => Promise<void>;
  getChatById: (chatType: ChatType, deliveryId?: string) => Chat | undefined;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

const STORAGE_KEY = '@medbox_chats';
const MESSAGES_KEY = '@medbox_messages';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chatsData, messagesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(MESSAGES_KEY),
      ]);

      if (chatsData) {
        const parsedChats = JSON.parse(chatsData);
        setChats(parsedChats.map((chat: any) => ({
          ...chat,
          lastMessageTime: chat.lastMessageTime ? new Date(chat.lastMessageTime) : undefined,
        })));
      } else {
        const defaultChats: Chat[] = [
          {
            id: 'support',
            type: 'support',
            name: 'Suporte MedBox',
            unreadCount: 0,
          },
        ];
        setChats(defaultChats);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultChats));
      }

      if (messagesData) {
        const parsedMessages = JSON.parse(messagesData);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChats = async (newChats: Chat[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChats));
    } catch (error) {
      console.error('Erro ao salvar chats:', error);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  // ✅ MELHORADO - Mais respostas automáticas variadas
  const generateAutoReply = (text: string, chatType: ChatType, messageCount: number): string => {
    const lowerText = text.toLowerCase();

    if (chatType === 'support') {
      // Respostas sobre ajuda/problema
      if (lowerText.includes('ajuda') || lowerText.includes('problema') || lowerText.includes('erro')) {
        const responses = [
          'Olá! Estou aqui para ajudar. Pode me explicar melhor o que aconteceu?',
          'Entendi que você precisa de ajuda. Qual é a situação? Vou te auxiliar! 😊',
          'Oi! Conte-me o problema com detalhes para eu poder ajudar você da melhor forma.',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Respostas sobre pagamento
      if (lowerText.includes('pagamento') || lowerText.includes('saque') || lowerText.includes('dinheiro') || lowerText.includes('pagar')) {
        const responses = [
          'Sobre pagamentos, normalmente processamos em até 24h úteis. Seu saldo está disponível na carteira. Precisa de mais alguma informação?',
          'Os pagamentos são liberados automaticamente após cada entrega concluída. Você pode solicitar saque a qualquer momento na aba Carteira. Tudo certo?',
          'Seu saldo fica disponível na carteira e você pode sacar quando quiser! O processamento leva até 1 dia útil. Tem alguma dúvida específica?',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Respostas sobre entrega
      if (lowerText.includes('entrega') || lowerText.includes('pedido') || lowerText.includes('rota')) {
        const responses = [
          'Entendi! Sobre entregas, você pode acompanhar todas na aba "Pedidos". Tem alguma dúvida específica sobre algum pedido?',
          'As entregas aparecem na aba de Pedidos com todas as informações. Está com dificuldade em alguma entrega específica?',
          'Você pode ver os detalhes de todas as entregas na seção de Pedidos. Precisa de ajuda com algo específico?',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Respostas de agradecimento
      if (lowerText.includes('obrigado') || lowerText.includes('valeu') || lowerText.includes('agradeço')) {
        const responses = [
          'Por nada! Estamos sempre à disposição. Boa sorte nas entregas! 🚀',
          'Disponha! Qualquer dúvida, estamos aqui. Boas entregas! 😊',
          'Fico feliz em ajudar! Conte conosco sempre. Sucesso nas rotas! 🏍️',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Resposta padrão
      const defaultResponses = [
        'Recebi sua mensagem! Nossa equipe vai analisar e responder em breve. Enquanto isso, você pode conferir nossa Central de Ajuda no menu.',
        'Entendi! Vou encaminhar para nossa equipe. Em breve você terá um retorno. Tem mais alguma dúvida?',
        'Anotado! Nossos especialistas vão verificar isso pra você. Enquanto isso, posso ajudar em mais alguma coisa?',
      ];
      return defaultResponses[messageCount % defaultResponses.length];
    }

    if (chatType === 'customer') {
      // Cliente avisando que chegou
      if (lowerText.includes('cheguei') || lowerText.includes('chegando') || lowerText.includes('aqui')) {
        const responses = [
          'Ótimo! Já estou descendo. Obrigado! 😊',
          'Perfeito! Estou indo buscar agora. Só um minutinho!',
          'Show! Já estou a caminho. Obrigado por avisar! 👍',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Cliente perguntando sobre tempo
      if (lowerText.includes('demora') || lowerText.includes('quanto tempo') || lowerText.includes('minutos') || lowerText.includes('longe')) {
        const responses = [
          'Estou a caminho! Pela rota, chego em aproximadamente 10 minutos.',
          'Já estou indo! Deve dar uns 8-10 minutos. Aguarde mais um pouquinho!',
          'Estou chegando! Mais uns 10 minutinhos e estou aí! 🏍️',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Cliente agradecendo
      if (lowerText.includes('obrigado') || lowerText.includes('valeu')) {
        const responses = [
          'De nada! Tenha um ótimo dia! 😊',
          'Disponha! Cuide-se! 🙂',
          'Por nada! Tudo de bom! ✨',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Cliente perguntando localização
      if (lowerText.includes('onde') || lowerText.includes('localização') || lowerText.includes('endereço')) {
        const responses = [
          'Estou seguindo o GPS. Você pode acompanhar minha localização em tempo real pelo app do iFood.',
          'Já estou no caminho! Pode acompanhar minha localização pelo aplicativo.',
          'Estou a caminho do seu endereço! O GPS está me guiando. Qualquer coisa, me avise!',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Resposta padrão
      const defaultResponses = [
        'Ok! Qualquer coisa, pode me chamar aqui. 👍',
        'Entendido! Estou de olho no chat. Pode falar! 😊',
        'Combinado! Vou manter você atualizado. 📱',
      ];
      return defaultResponses[messageCount % defaultResponses.length];
    }

    if (chatType === 'pharmacy') {
      // Entregador avisando que chegou
      if (lowerText.includes('cheguei') || lowerText.includes('chegando') || lowerText.includes('aqui')) {
        const responses = [
          'Perfeito! O pedido está quase pronto. Aguarde só mais 2 minutos, por favor.',
          'Ótimo! Pode entrar, o pedido já está separado. Só conferir e pode levar!',
          'Show! Já está tudo pronto. É só passar no balcão que a gente entrega pra você!',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Perguntando sobre tempo/pedido pronto
      if (lowerText.includes('pronto') || lowerText.includes('demora') || lowerText.includes('quanto tempo') || lowerText.includes('falta')) {
        const responses = [
          'Estamos separando os itens. Fica pronto em aproximadamente 5 minutos. Obrigado pela paciência!',
          'Só mais alguns minutinhos! Estamos conferindo tudo certinho. Logo está pronto! ⏰',
          'Está quase! Uns 3-5 minutos e está liberado. Desculpe a espera! 🙏',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Perguntando sobre receita
      if (lowerText.includes('receita') || lowerText.includes('documento') || lowerText.includes('prescrição')) {
        const responses = [
          'Sim, este pedido tem itens com receita. Já está tudo separado e conferido.',
          'Tem receita sim! Já validamos e está tudo OK. Pode ficar tranquilo!',
          'Correto! Os itens controlados já foram separados com a receita. Tudo certo! ✅',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Agradecimento
      if (lowerText.includes('obrigado') || lowerText.includes('valeu')) {
        const responses = [
          'Disponha! Boa entrega! 🏍️',
          'Por nada! Cuidado na estrada! 🚦',
          'De nada! Sucesso na entrega! 🎯',
        ];
        return responses[messageCount % responses.length];
      }
      
      // Resposta padrão
      const defaultResponses = [
        'Recebido! Qualquer problema, nos avise. Estamos aqui!',
        'Ok! Pode contar conosco. Qualquer dúvida, é só chamar! 👍',
        'Anotado! Se precisar de algo, estamos à disposição! 😊',
      ];
      return defaultResponses[messageCount % defaultResponses.length];
    }

    return 'Mensagem recebida!';
  };

  const sendMessage = async (text: string, chatType: ChatType, deliveryId?: string) => {
    const chatId = deliveryId ? `${chatType}_${deliveryId}` : chatType;
    
    // Cria a mensagem do usuário
    const userMessage: Message = {
      id: `${Date.now()}_user`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      chatType,
      deliveryId,
    };

    // ✅ CORREÇÃO - Atualiza estado IMEDIATAMENTE
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await saveMessages(newMessages);

    // Atualiza ou cria o chat
    const existingChatIndex = chats.findIndex(c => c.id === chatId);
    let updatedChats = [...chats];

    if (existingChatIndex !== -1) {
      updatedChats[existingChatIndex] = {
        ...updatedChats[existingChatIndex],
        lastMessage: text,
        lastMessageTime: new Date(),
      };
    } else {
      const chatNames: Record<ChatType, string> = {
        support: 'Suporte MedBox',
        customer: 'Cliente',
        pharmacy: 'Farmácia',
      };

      updatedChats.push({
        id: chatId,
        type: chatType,
        name: chatNames[chatType],
        lastMessage: text,
        lastMessageTime: new Date(),
        unreadCount: 0,
        deliveryId,
      });
    }

    setChats(updatedChats);
    await saveChats(updatedChats);

    // Atualiza status para "sent"
    setTimeout(() => {
      const updatedMessages = newMessages.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' as MessageStatus } : msg
      );
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    }, 500);

    // Atualiza status para "delivered"
    setTimeout(() => {
      const updatedMessages = newMessages.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' as MessageStatus } : msg
      );
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    }, 1000);

    // Conta quantas mensagens do usuário já foram enviadas (para variar respostas)
    const userMessageCount = newMessages.filter(
      m => m.chatType === chatType && m.deliveryId === deliveryId && m.sender === 'user'
    ).length;

    // Gera resposta automática com delay de 1-3 segundos
    const replyDelay = Math.random() * 2000 + 1000;
    
    setTimeout(async () => {
      const autoReplyText = generateAutoReply(text, chatType, userMessageCount);
      const autoReply: Message = {
        id: `${Date.now()}_auto`,
        text: autoReplyText,
        sender: 'other',
        timestamp: new Date(),
        status: 'delivered',
        chatType,
        deliveryId,
      };

      // ✅ CORREÇÃO - Usa o estado mais recente
      setMessages(prev => {
        const messagesWithReply = [...prev, autoReply];
        saveMessages(messagesWithReply);
        return messagesWithReply;
      });

      // Atualiza chat com a resposta
      setChats(prev => {
        const chatIndex = prev.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
          const updated = [...prev];
          updated[chatIndex] = {
            ...updated[chatIndex],
            lastMessage: autoReplyText,
            lastMessageTime: new Date(),
            unreadCount: updated[chatIndex].unreadCount + 1,
          };
          saveChats(updated);
          return updated;
        }
        return prev;
      });
    }, replyDelay);
  };

  const getMessagesByChat = (chatType: ChatType, deliveryId?: string): Message[] => {
    return messages
      .filter(m => m.chatType === chatType && m.deliveryId === deliveryId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const markAsRead = async (chatType: ChatType, deliveryId?: string) => {
    const chatId = deliveryId ? `${chatType}_${deliveryId}` : chatType;
    const chatIndex = chats.findIndex(c => c.id === chatId);
    
    if (chatIndex !== -1) {
      const updatedChats = [...chats];
      updatedChats[chatIndex].unreadCount = 0;
      setChats(updatedChats);
      await saveChats(updatedChats);
    }

    const updatedMessages = messages.map(msg => {
      if (msg.chatType === chatType && msg.deliveryId === deliveryId && msg.sender === 'other') {
        return { ...msg, status: 'read' as MessageStatus };
      }
      return msg;
    });
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);
  };

  const getChatById = (chatType: ChatType, deliveryId?: string): Chat | undefined => {
    const chatId = deliveryId ? `${chatType}_${deliveryId}` : chatType;
    return chats.find(c => c.id === chatId);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        sendMessage,
        getMessagesByChat,
        markAsRead,
        getChatById,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};