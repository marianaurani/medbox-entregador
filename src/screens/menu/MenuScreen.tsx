// src/screens/menu/MenuScreen.tsx (ALL-IN-ONE COMPLETO)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useBank } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type MenuNavigationProp = NavigationProp<{
  MenuHome: undefined;
  BankData: undefined;
  Chat: { chatType: string; chatName: string; deliveryId?: string };
  Reports: undefined;
  Notifications: undefined;
  Help: undefined;
}>;

const MenuScreen: React.FC = () => {
  const navigation = useNavigation<MenuNavigationProp>();
  const { user, signOut, updateProfile } = useAuth();
  const { pixKeys, hasBankAccount, defaultPixKey } = useBank();

  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'name' | 'phone' | 'email'>('name');
  const [editValue, setEditValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getVehicleLabel = (type?: string) => {
    switch (type) {
      case 'moto': return 'Moto';
      case 'carro': return 'Carro';
      case 'bike': return 'Bicicleta';
      default: return 'Não informado';
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'aprovado':
        return { color: colors.success, icon: 'checkmark-circle', label: 'Aprovado' };
      case 'pendente':
        return { color: colors.warning, icon: 'time', label: 'Pendente' };
      case 'rejeitado':
        return { color: colors.error, icon: 'close-circle', label: 'Rejeitado' };
      default:
        return { color: colors.textSecondary, icon: 'help-circle', label: 'Desconhecido' };
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (updateProfile) {
          await updateProfile({ photo: result.assets[0].uri });
        }
        
        Alert.alert('Sucesso!', 'Foto atualizada com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditModal = (field: 'name' | 'phone' | 'email') => {
    setEditField(field);
    
    switch (field) {
      case 'name':
        setEditValue(user?.name || '');
        break;
      case 'phone':
        setEditValue(user?.phone || '');
        break;
      case 'email':
        setEditValue(user?.email || '');
        break;
    }
    
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editValue.trim()) {
        Alert.alert('Atenção', 'O campo não pode estar vazio.');
        return;
      }

      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (updateProfile) {
        await updateProfile({ [editField]: editValue.trim() });
      }

      setIsEditModalVisible(false);
      Alert.alert('Sucesso!', 'Informação atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a informação.');
    } finally {
      setIsSaving(false);
    }
  };

  const getEditModalTitle = () => {
    switch (editField) {
      case 'name': return 'Editar Nome';
      case 'phone': return 'Editar Telefone';
      case 'email': return 'Editar E-mail';
    }
  };

  const getEditModalPlaceholder = () => {
    switch (editField) {
      case 'name': return 'Digite seu nome completo';
      case 'phone': return 'Digite seu telefone';
      case 'email': return 'Digite seu e-mail';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleSupportChat = () => {
    navigation.navigate('Chat', {
      chatType: 'support',
      chatName: 'Suporte MedBox',
    });
  };

  const getBankStatus = () => {
    if (pixKeys.length > 0 && hasBankAccount) return { text: 'Completo', color: colors.success };
    if (pixKeys.length > 0 || hasBankAccount) return { text: 'Parcial', color: colors.warning };
    return { text: 'Pendente', color: colors.error };
  };

  const bankStatus = getBankStatus();
  const statusInfo = getStatusInfo(user?.registrationStatus);

  const MenuItem = ({ icon, title, subtitle, onPress, color = colors.text, badge, badgeColor }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {badge !== undefined && (
            <View style={[styles.badge, badgeColor && { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card de Perfil Expansível */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => setIsProfileExpanded(!isProfileExpanded)}
            activeOpacity={0.9}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileLeft}>
                <View style={styles.avatarWrapper}>
                  {user?.photo ? (
                    <Image source={{ uri: user.photo }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarContainer}>
                      <Ionicons name="person" size={32} color="white" />
                    </View>
                  )}
                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="white" />
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  <View style={styles.profileStatusRow}>
                    <View style={[styles.statusBadgeSmall, { backgroundColor: statusInfo.color }]}>
                      <Ionicons name={statusInfo.icon as any} size={10} color="white" />
                      <Text style={styles.statusTextSmall}>{statusInfo.label}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons 
                name={isProfileExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={colors.textLight} 
              />
            </View>

            {/* Detalhes Expansíveis */}
            {isProfileExpanded && (
              <View style={styles.profileDetails}>
                <View style={styles.detailsDivider} />
                
                <View style={styles.detailRow}>
                  <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>CPF:</Text>
                  <Text style={styles.detailValue}>{formatCPF(user?.cpf || '')}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Telefone:</Text>
                  <Text style={styles.detailValue}>
                    {user?.phone ? formatPhone(user.phone) : 'Não informado'}
                  </Text>
                  <TouchableOpacity onPress={() => openEditModal('phone')}>
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>E-mail:</Text>
                  <Text style={styles.detailValue}>
                    {user?.email || 'Não informado'}
                  </Text>
                  <TouchableOpacity onPress={() => openEditModal('email')}>
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {user?.vehicleType && (
                  <View style={styles.detailRow}>
                    <Ionicons name="bicycle" size={18} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Veículo:</Text>
                    <Text style={styles.detailValue}>{getVehicleLabel(user.vehicleType)}</Text>
                  </View>
                )}

                <View style={styles.detailsDivider} />

                <View style={styles.profileActions}>
                  <TouchableOpacity 
                    style={styles.profileActionButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="camera-outline" size={18} color={colors.primary} />
                    <Text style={styles.profileActionText}>Alterar Foto</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.profileActionButton}
                    onPress={() => openEditModal('name')}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                    <Text style={styles.profileActionText}>Editar Nome</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('BankData')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="wallet" size={28} color={colors.primary} />
              </View>
              <Text style={styles.quickActionTitle}>Dados Bancários</Text>
              <View style={[styles.statusBadge, { backgroundColor: bankStatus.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: bankStatus.color }]} />
                <Text style={[styles.statusText, { color: bankStatus.color }]}>
                  {bankStatus.text}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="stats-chart" size={28} color={colors.info} />
              </View>
              <Text style={styles.quickActionTitle}>Relatórios</Text>
              <Text style={styles.quickActionSubtitle}>Desempenho</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleSupportChat}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="chatbubble-ellipses" size={28} color={colors.success} />
              </View>
              <Text style={styles.quickActionTitle}>Suporte</Text>
              <Text style={styles.quickActionSubtitle}>Chat online</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="notifications" size={28} color={colors.warning} />
              </View>
              <Text style={styles.quickActionTitle}>Avisos</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dados da Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Conta</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="wallet-outline"
              title="Dados Bancários"
              subtitle={defaultPixKey ? `Padrão: ${defaultPixKey.key}` : 'Nenhuma chave cadastrada'}
              onPress={() => navigation.navigate('BankData')}
              color={colors.primary}
              badge={pixKeys.length}
              badgeColor={bankStatus.color}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="document-text-outline"
              title="Documentos"
              subtitle={user?.cnhPhoto ? 'CNH enviada' : 'CNH pendente'}
              onPress={() => Alert.alert('Documentos', 'Em breve...')}
              color={colors.info}
            />
            {user?.vehicleType && (
              <>
                <View style={styles.divider} />
                <MenuItem
                  icon="bicycle-outline"
                  title="Veículo"
                  subtitle={getVehicleLabel(user.vehicleType)}
                  onPress={() => Alert.alert('Veículo', 'Em breve...')}
                  color={colors.success}
                />
              </>
            )}
          </View>
        </View>

        {/* Central de Ajuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Central de Ajuda</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="help-circle-outline"
              title="Perguntas Frequentes"
              subtitle="Tire suas dúvidas rapidamente"
              onPress={() => navigation.navigate('Help')}
              color={colors.info}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="star-outline"
              title="Avalie o App"
              subtitle="Sua opinião é importante"
              onPress={() => Alert.alert('Avaliar', 'Redirecionando para a loja...')}
              color={colors.warning}
            />
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="lock-closed-outline"
              title="Segurança"
              subtitle="Senha e autenticação"
              onPress={() => Alert.alert('Segurança', 'Em breve...')}
              color={colors.text}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="language-outline"
              title="Idioma"
              subtitle="Português (Brasil)"
              onPress={() => Alert.alert('Idioma', 'Em breve...')}
              color={colors.text}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="information-circle-outline"
              title="Sobre o MedBox"
              subtitle="Versão 1.0.0"
              onPress={() => Alert.alert('Sobre', 'MedBox Entregador v1.0.0\n\nDesenvolvido com ❤️')}
              color={colors.textSecondary}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="document-text-outline"
              title="Termos de Uso"
              onPress={() => Alert.alert('Termos', 'Em breve...')}
              color={colors.textSecondary}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Política de Privacidade"
              onPress={() => Alert.alert('Privacidade', 'Em breve...')}
              color={colors.textSecondary}
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

      {/* Modal de Edição */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getEditModalTitle()}</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={getEditModalPlaceholder()}
              placeholderTextColor={colors.textLight}
              keyboardType={editField === 'email' ? 'email-address' : editField === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize={editField === 'email' ? 'none' : 'words'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  profileSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  profileStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  profileDetails: {
    marginTop: 16,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  profileActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.medboxLightGreen,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  profileActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.backgroundLight,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
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
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
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
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default MenuScreen;