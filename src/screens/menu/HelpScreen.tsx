// src/screens/menu/HelpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'delivery' | 'payment' | 'account' | 'technical';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'delivery',
    question: 'Como aceitar uma entrega?',
    answer: 'Na tela inicial, você verá as entregas disponíveis. Toque no card da entrega desejada e depois em "Aceitar Entrega". Você terá 30 segundos para aceitar antes que seja oferecida a outro entregador.',
  },
  {
    id: '2',
    category: 'delivery',
    question: 'Posso cancelar uma entrega após aceitar?',
    answer: 'Sim, mas cancelamentos frequentes podem afetar sua pontuação. Só cancele em casos de emergência. Vá até os detalhes da entrega e selecione "Cancelar Entrega".',
  },
  {
    id: '3',
    category: 'delivery',
    question: 'Como funciona o cálculo da taxa de entrega?',
    answer: 'A taxa é calculada com base na distância entre a farmácia e o cliente, horário (períodos de pico pagam mais), e demanda na região. Você sempre vê o valor antes de aceitar.',
  },
  {
    id: '4',
    category: 'payment',
    question: 'Quando recebo meus pagamentos?',
    answer: 'Os valores ficam disponíveis imediatamente após a conclusão da entrega. Você pode sacar a qualquer momento, desde que tenha no mínimo R$ 10,00 disponíveis.',
  },
  {
    id: '5',
    category: 'payment',
    question: 'Como fazer um saque?',
    answer: 'Acesse sua Carteira > Sacar. Escolha sua chave PIX cadastrada, digite o valor e confirme. O dinheiro cai na hora em dias úteis (até 1h em finais de semana).',
  },
  {
    id: '6',
    category: 'payment',
    question: 'Posso cadastrar mais de uma chave PIX?',
    answer: 'Sim! Vá em Menu > Perfil > Dados Bancários > Adicionar Chave PIX. Você pode ter várias chaves e escolher qual usar em cada saque.',
  },
  {
    id: '7',
    category: 'account',
    question: 'Como atualizar meus dados?',
    answer: 'Vá em Menu > Perfil. Lá você pode editar nome, telefone, e-mail, foto, e gerenciar suas informações de veículo e documentos.',
  },
  {
    id: '8',
    category: 'account',
    question: 'O que fazer se meu cadastro foi rejeitado?',
    answer: 'Entre em contato com o suporte através do chat. Nossa equipe analisará seu caso e orientará sobre os próximos passos para regularizar seu cadastro.',
  },
  {
    id: '9',
    category: 'technical',
    question: 'O app está lento ou travando',
    answer: 'Tente: 1) Fechar e reabrir o app, 2) Verificar sua conexão com internet, 3) Limpar o cache nas configurações do celular, 4) Atualizar para a versão mais recente.',
  },
  {
    id: '10',
    category: 'technical',
    question: 'Não consigo fazer login',
    answer: 'Verifique se está usando o CPF correto (apenas números). Se esqueceu a senha, use "Esqueci minha senha" na tela de login. Se o problema persistir, contate o suporte.',
  },
];

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todas', icon: 'apps-outline' },
    { id: 'delivery', label: 'Entregas', icon: 'cube-outline' },
    { id: 'payment', label: 'Pagamentos', icon: 'cash-outline' },
    { id: 'account', label: 'Conta', icon: 'person-outline' },
    { id: 'technical', label: 'Técnico', icon: 'settings-outline' },
  ];

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contatar Suporte',
      'Escolha como deseja entrar em contato:',
      [
        {
          text: 'Chat',
          onPress: () => {
            // Aqui você navegaria para a tela de chat
            Alert.alert('Chat', 'Abrindo chat de suporte...');
          },
        },
        {
          text: 'WhatsApp',
          onPress: () => {
            Linking.openURL('https://wa.me/5511999999999');
          },
        },
        {
          text: 'E-mail',
          onPress: () => {
            Linking.openURL('mailto:suporte@medbox.com.br');
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const CategoryButton = ({ category }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons
        name={category.icon}
        size={20}
        color={selectedCategory === category.id ? 'white' : colors.textSecondary}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextActive,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const FAQItemComponent = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleContactSupport}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>Falar com Suporte</Text>
            <Text style={styles.quickActionSubtitle}>Estamos online</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => Linking.openURL('tel:08008887777')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="call" size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionTitle}>Ligar</Text>
            <Text style={styles.quickActionSubtitle}>0800 888 7777</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(category => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            Perguntas Frequentes ({filteredFAQ.length})
          </Text>
          <View style={styles.faqList}>
            {filteredFAQ.map(item => (
              <FAQItemComponent key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Still Need Help */}
        <View style={styles.needHelpSection}>
          <Ionicons name="information-circle" size={32} color={colors.info} />
          <Text style={styles.needHelpTitle}>Ainda precisa de ajuda?</Text>
          <Text style={styles.needHelpText}>
            Nossa equipe está pronta para ajudar você com qualquer dúvida ou problema.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
            <Text style={styles.contactButtonText}>Entrar em Contato</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Recursos Adicionais</Text>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Alert.alert('Em breve', 'Tutorial em desenvolvimento')}
          >
            <Ionicons name="play-circle-outline" size={24} color={colors.info} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Tutoriais em Vídeo</Text>
              <Text style={styles.resourceSubtitle}>Aprenda com tutoriais passo a passo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://medbox.com.br/termos')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Termos de Uso</Text>
              <Text style={styles.resourceSubtitle}>Leia nossos termos e condições</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://medbox.com.br/privacidade')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Política de Privacidade</Text>
              <Text style={styles.resourceSubtitle}>Como protegemos seus dados</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoriesSection: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  faqSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingLeft: 44,
  },
  needHelpSection: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  needHelpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  needHelpText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  resourcesSection: {
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    gap: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});

export default HelpScreen;