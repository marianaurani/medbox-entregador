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
  clearChat: (chatType: ChatType, deliveryId?: string) => Promise<void>;
  clearOldMessages: (daysToKeep?: number) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

const STORAGE_KEY = '@medbox_chats';
const MESSAGES_KEY = '@medbox_messages';

// ✨ CONFIGURAÇÕES DE LIMPEZA AUTOMÁTICA
const CLEANUP_CONFIG = {
  support: 30,        // Suporte: 30 dias (caso precise consultar)
  customer: 7,        // Cliente: 7 dias após última mensagem
  pharmacy: 7,        // Farmácia: 7 dias após última mensagem
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // ✨ Limpa mensagens antigas ao iniciar o app
    performSmartCleanup();
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

  // ✨ NOVA FUNÇÃO - Limpeza automática inteligente por tipo de chat
  const performSmartCleanup = async () => {
    const now = new Date();
    let totalRemoved = 0;

    setMessages(prev => {
      const filtered = prev.filter(msg => {
        const daysToKeep = CLEANUP_CONFIG[msg.chatType];
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const shouldKeep = msg.timestamp >= cutoffDate;
        if (!shouldKeep) totalRemoved++;
        
        return shouldKeep;
      });

      if (totalRemoved > 0) {
        console.log(`🗑️ Limpeza inteligente: ${totalRemoved} mensagens antigas removidas`);
        console.log(`   📋 Regras: Suporte (${CLEANUP_CONFIG.support}d) | Cliente/Farmácia (${CLEANUP_CONFIG.customer}d)`);
        saveMessages(filtered);
      }

      return filtered;
    });

    // Remove chats vazios (exceto suporte)
    setChats(prev => {
      const filtered = prev.filter(chat => {
        if (chat.type === 'support') return true; // Sempre mantém suporte
        
        const hasMessages = messages.some(
          m => m.chatType === chat.type && m.deliveryId === chat.deliveryId
        );
        
        return hasMessages;
      });

      if (filtered.length < prev.length) {
        console.log(`🗑️ ${prev.length - filtered.length} chat(s) vazio(s) removido(s)`);
        saveChats(filtered);
      }

      return filtered;
    });
  };

  const generateAutoReply = (text: string, chatType: ChatType, messageCount: number): string => {
    const lowerText = text.toLowerCase();

    if (chatType === 'support') {
      if (lowerText.includes('ajuda') || lowerText.includes('problema') || lowerText.includes('erro')) {
        const responses = [
          'Olá! Estou aqui para ajudar. Pode me explicar melhor o que aconteceu?',
          'Entendi que você precisa de ajuda. Qual é a situação? Vou te auxiliar! 😊',
          'Oi! Conte-me o problema com detalhes para eu poder ajudar você da melhor forma.',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('pagamento') || lowerText.includes('saque') || lowerText.includes('dinheiro') || lowerText.includes('pagar')) {
        const responses = [
          'Sobre pagamentos, normalmente processamos em até 24h úteis. Seu saldo está disponível na carteira. Precisa de mais alguma informação?',
          'Os pagamentos são liberados automaticamente após cada entrega concluída. Você pode solicitar saque a qualquer momento na aba Carteira. Tudo certo?',
          'Seu saldo fica disponível na carteira e você pode sacar quando quiser! O processamento leva até 1 dia útil. Tem alguma dúvida específica?',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('entrega') || lowerText.includes('pedido') || lowerText.includes('rota')) {
        const responses = [
          'Entendi! Sobre entregas, você pode acompanhar todas na aba "Pedidos". Tem alguma dúvida específica sobre algum pedido?',
          'As entregas aparecem na aba de Pedidos com todas as informações. Está com dificuldade em alguma entrega específica?',
          'Você pode ver os detalhes de todas as entregas na seção de Pedidos. Precisa de ajuda com algo específico?',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('obrigado') || lowerText.includes('valeu') || lowerText.includes('agradeço')) {
        const responses = [
          'Por nada! Estamos sempre à disposição. Boa sorte nas entregas! 🚀',
          'Disponha! Qualquer dúvida, estamos aqui. Boas entregas! 😊',
          'Fico feliz em ajudar! Conte conosco sempre. Sucesso nas rotas! 🏍️',
        ];
        return responses[messageCount % responses.length];
      }
      
      const defaultResponses = [
        'Recebi sua mensagem! Nossa equipe vai analisar e responder em breve. Enquanto isso, você pode conferir nossa Central de Ajuda no menu.',
        'Entendi! Vou encaminhar para nossa equipe. Em breve você terá um retorno. Tem mais alguma dúvida?',
        'Anotado! Nossos especialistas vão verificar isso pra você. Enquanto isso, posso ajudar em mais alguma coisa?',
      ];
      return defaultResponses[messageCount % defaultResponses.length];
    }

    if (chatType === 'customer') {
      if (lowerText.includes('cheguei') || lowerText.includes('chegando') || lowerText.includes('aqui')) {
        const responses = [
          'Ótimo! Já estou descendo. Obrigado! 😊',
          'Perfeito! Estou indo buscar agora. Só um minutinho!',
          'Show! Já estou a caminho. Obrigado por avisar! 👍',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('demora') || lowerText.includes('quanto tempo') || lowerText.includes('minutos') || lowerText.includes('longe')) {
        const responses = [
          'Estou a caminho! Pela rota, chego em aproximadamente 10 minutos.',
          'Já estou indo! Deve dar uns 8-10 minutos. Aguarde mais um pouquinho!',
          'Estou chegando! Mais uns 10 minutinhos e estou aí! 🏍️',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('obrigado') || lowerText.includes('valeu')) {
        const responses = [
          'De nada! Tenha um ótimo dia! 😊',
          'Disponha! Cuide-se! 🙂',
          'Por nada! Tudo de bom! ✨',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('onde') || lowerText.includes('localização') || lowerText.includes('endereço')) {
        const responses = [
          'Estou seguindo o GPS. Você pode acompanhar minha localização em tempo real pelo app do iFood.',
          'Já estou no caminho! Pode acompanhar minha localização pelo aplicativo.',
          'Estou a caminho do seu endereço! O GPS está me guiando. Qualquer coisa, me avise!',
        ];
        return responses[messageCount % responses.length];
      }
      
      const defaultResponses = [
        'Ok! Qualquer coisa, pode me chamar aqui. 👍',
        'Entendido! Estou de olho no chat. Pode falar! 😊',
        'Combinado! Vou manter você atualizado. 📱',
      ];
      return defaultResponses[messageCount % defaultResponses.length];
    }

    if (chatType === 'pharmacy') {
      if (lowerText.includes('cheguei') || lowerText.includes('chegando') || lowerText.includes('aqui')) {
        const responses = [
          'Perfeito! O pedido está quase pronto. Aguarde só mais 2 minutos, por favor.',
          'Ótimo! Pode entrar, o pedido já está separado. Só conferir e pode levar!',
          'Show! Já está tudo pronto. É só passar no balcão que a gente entrega pra você!',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('pronto') || lowerText.includes('demora') || lowerText.includes('quanto tempo') || lowerText.includes('falta')) {
        const responses = [
          'Estamos separando os itens. Fica pronto em aproximadamente 5 minutos. Obrigado pela paciência!',
          'Só mais alguns minutinhos! Estamos conferindo tudo certinho. Logo está pronto! ⏰',
          'Está quase! Uns 3-5 minutos e está liberado. Desculpe a espera! 🙏',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('receita') || lowerText.includes('documento') || lowerText.includes('prescrição')) {
        const responses = [
          'Sim, este pedido tem itens com receita. Já está tudo separado e conferido.',
          'Tem receita sim! Já validamos e está tudo OK. Pode ficar tranquilo!',
          'Correto! Os itens controlados já foram separados com a receita. Tudo certo! ✅',
        ];
        return responses[messageCount % responses.length];
      }
      
      if (lowerText.includes('obrigado') || lowerText.includes('valeu')) {
        const responses = [
          'Disponha! Boa entrega! 🏍️',
          'Por nada! Cuidado na estrada! 🚦',
          'De nada! Sucesso na entrega! 🎯',
        ];
        return responses[messageCount % responses.length];
      }
      
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
    
    const userMessage: Message = {
      id: `${Date.now()}_user`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      chatType,
      deliveryId,
    };

    // ✅ SOLUÇÃO CRÍTICA: Atualiza o estado diretamente com o array completo
    setMessages(currentMessages => {
      const newMessages = [...currentMessages, userMessage];
      // Salva imediatamente (não espera o próximo render)
      setTimeout(() => saveMessages(newMessages), 0);
      return newMessages;
    });

    // Atualiza ou cria o chat
    setChats(prev => {
      const existingChatIndex = prev.findIndex(c => c.id === chatId);
      let updatedChats = [...prev];

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

      saveChats(updatedChats);
      return updatedChats;
    });

    // Atualiza status para "sent"
    setTimeout(() => {
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' as MessageStatus } : msg
        );
        saveMessages(updated);
        return updated;
      });
    }, 500);

    // Atualiza status para "delivered"
    setTimeout(() => {
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'delivered' as MessageStatus } : msg
        );
        saveMessages(updated);
        return updated;
      });
    }, 1000);

    // Conta mensagens do usuário para variar respostas
    const userMessageCount = messages.filter(
      m => m.chatType === chatType && m.deliveryId === deliveryId && m.sender === 'user'
    ).length;

    // Gera resposta automática com delay de 1-3 segundos
    const replyDelay = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
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

      setMessages(prev => {
        const messagesWithReply = [...prev, autoReply];
        saveMessages(messagesWithReply);
        return messagesWithReply;
      });

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
    
    setChats(prev => {
      const chatIndex = prev.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        const updated = [...prev];
        updated[chatIndex].unreadCount = 0;
        saveChats(updated);
        return updated;
      }
      return prev;
    });

    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.chatType === chatType && msg.deliveryId === deliveryId && msg.sender === 'other') {
          return { ...msg, status: 'read' as MessageStatus };
        }
        return msg;
      });
      saveMessages(updated);
      return updated;
    });
  };

  const getChatById = (chatType: ChatType, deliveryId?: string): Chat | undefined => {
    const chatId = deliveryId ? `${chatType}_${deliveryId}` : chatType;
    return chats.find(c => c.id === chatId);
  };

  const clearChat = async (chatType: ChatType, deliveryId?: string) => {
    const chatId = deliveryId ? `${chatType}_${deliveryId}` : chatType;

    setMessages(prev => {
      const filtered = prev.filter(
        m => !(m.chatType === chatType && m.deliveryId === deliveryId)
      );
      saveMessages(filtered);
      return filtered;
    });

    if (chatType !== 'support') {
      setChats(prev => {
        const filtered = prev.filter(c => c.id !== chatId);
        saveChats(filtered);
        return filtered;
      });
    } else {
      setChats(prev => {
        const updated = prev.map(c => {
          if (c.id === chatId) {
            return { ...c, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 };
          }
          return c;
        });
        saveChats(updated);
        return updated;
      });
    }
  };

  const clearOldMessages = async (daysToKeep?: number) => {
    if (daysToKeep) {
      // Limpeza manual com dias específicos
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.timestamp >= cutoffDate);
        
        if (filtered.length < prev.length) {
          console.log(`🗑️ Removidas ${prev.length - filtered.length} mensagens antigas (mais de ${daysToKeep} dias)`);
          saveMessages(filtered);
        }
        
        return filtered;
      });
    } else {
      // Limpeza inteligente automática
      performSmartCleanup();
    }
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
        clearChat,
        clearOldMessages,
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