// src/screens/menu/MenuScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';

type MenuStackParamList = {
  MenuHome: undefined;
  Profile: undefined;
};

const MenuScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MenuStackParamList>>();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color = colors.text,
    showArrow = true 
  }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Perfil do Usuário */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
        </TouchableOpacity>

        {/* Seção Financeiro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financeiro</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="document-text-outline"
              title="Extrato Detalhado"
              subtitle="Veja todas as transações"
              onPress={() => Alert.alert('Extrato', 'Em desenvolvimento...')}
              color={colors.primary}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="stats-chart-outline"
              title="Relatórios"
              subtitle="Análise de ganhos e desempenho"
              onPress={() => Alert.alert('Relatórios', 'Em desenvolvimento...')}
              color={colors.info}
            />
          </View>
        </View>

        {/* Seção Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="help-circle-outline"
              title="Ajuda"
              subtitle="Central de ajuda e FAQ"
              onPress={() => Alert.alert('Ajuda', 'Em desenvolvimento...')}
              color={colors.warning}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="chatbubble-outline"
              title="Falar com Suporte"
              subtitle="Entre em contato conosco"
              onPress={() => Alert.alert('Suporte', 'Em desenvolvimento...')}
              color={colors.info}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="star-outline"
              title="Avalie o App"
              subtitle="Conte sua experiência"
              onPress={() => Alert.alert('Avaliar', 'Em desenvolvimento...')}
              color={colors.warning}
            />
          </View>
        </View>

        {/* Seção Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="notifications-outline"
              title="Notificações"
              subtitle="Gerenciar alertas e avisos"
              onPress={() => Alert.alert('Notificações', 'Em desenvolvimento...')}
              color={colors.text}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="lock-closed-outline"
              title="Privacidade e Segurança"
              subtitle="Gerencie sua conta"
              onPress={() => Alert.alert('Privacidade', 'Em desenvolvimento...')}
              color={colors.text}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="language-outline"
              title="Idioma"
              subtitle="Português (Brasil)"
              onPress={() => Alert.alert('Idioma', 'Em desenvolvimento...')}
              color={colors.text}
            />
          </View>
        </View>

        {/* Seção Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="information-circle-outline"
              title="Sobre o MedBox"
              subtitle="Versão 1.0.0"
              onPress={() => Alert.alert('Sobre', 'MedBox Entregador v1.0.0')}
              color={colors.text}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="document-outline"
              title="Termos de Uso"
              onPress={() => Alert.alert('Termos', 'Em desenvolvimento...')}
              color={colors.text}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Política de Privacidade"
              onPress={() => Alert.alert('Privacidade', 'Em desenvolvimento...')}
              color={colors.text}
            />
          </View>
        </View>

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});

export default MenuScreen;