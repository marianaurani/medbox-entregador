// src/screens/profile/ProfileScreen.tsx
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

type ProfileStackParamList = {
  ProfileHome: undefined;
  BankData: undefined;
  AddPixKey: { pixKeyId?: string } | undefined;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { user, updateProfile } = useAuth();
  const { pixKeys, defaultPixKey } = useBank();

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

  const getVehicleIcon = (type?: string): any => {
    switch (type) {
      case 'moto': return 'bicycle';
      case 'carro': return 'car';
      case 'bike': return 'bicycle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'aprovado':
        return { color: colors.success, icon: 'checkmark-circle', label: 'Cadastro Aprovado' };
      case 'pendente':
        return { color: colors.warning, icon: 'time', label: 'Cadastro Pendente' };
      case 'rejeitado':
        return { color: colors.error, icon: 'close-circle', label: 'Cadastro Rejeitado' };
      default:
        return { color: colors.textSecondary, icon: 'help-circle', label: 'Status Desconhecido' };
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
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
        
        // Simula upload
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

      // Simula salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (updateProfile) {
        await updateProfile({
          [editField]: editValue.trim(),
        });
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

  const ProfileOption = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    badge,
  }: any) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{title ?? ''}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle ?? ''}</Text>}
        </View>
      </View>
      <View style={styles.optionRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge ?? ''}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  const statusInfo = getStatusInfo(user?.registrationStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar e Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={48} color="white" />
              </View>
            )}
            
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.editPhotoButton}
              onPress={handlePickImage}
              disabled={isUploading}
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name ?? ''}</Text>
          <Text style={styles.userEmail}>{user?.email ?? 'Nenhum e-mail cadastrado'}</Text>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color="white" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome Completo</Text>
                <Text style={styles.infoValue}>{user?.name ?? ''}</Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal('name')}>
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>{formatCPF(user?.cpf ?? '')}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>
                  {user?.phone ? formatPhone(user.phone) : 'Não informado'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal('phone')}>
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>
                  {user?.email || 'Não informado'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal('email')}>
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Informações do Veículo */}
        {user?.vehicleType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons 
                  name={getVehicleIcon(user.vehicleType)} 
                  size={20} 
                  color={colors.textSecondary} 
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tipo de Veículo</Text>
                  <Text style={styles.infoValue}>
                    {getVehicleLabel(user.vehicleType)}
                  </Text>
                </View>
              </View>
              
              {user.cnhPhoto && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>CNH</Text>
                      <Text style={styles.infoValue}>Documento enviado</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="eye-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Opções */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações da Conta</Text>
          <View style={styles.card}>
            <ProfileOption
              icon="wallet-outline"
              title="Dados Bancários"
              subtitle={defaultPixKey ? `Chave padrão: ${defaultPixKey.key ?? ''}` : 'Nenhuma chave cadastrada'}
              onPress={() => navigation.navigate('BankData')}
              badge={pixKeys.length > 0 ? pixKeys.length.toString() : undefined}
            />
            
            <View style={styles.divider} />
            
            <ProfileOption
              icon="shield-checkmark-outline"
              title="Segurança"
              subtitle="Alterar senha e autenticação"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            
            <View style={styles.divider} />
            
            <ProfileOption
              icon="notifications-outline"
              title="Notificações"
              subtitle="Gerencie suas preferências"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            
            <View style={styles.divider} />
            
            <ProfileOption
              icon="document-text-outline"
              title="Documentos"
              subtitle="CNH e outros documentos"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.card}>
            <ProfileOption
              icon="help-circle-outline"
              title="Central de Ajuda"
              subtitle="FAQ e tutoriais"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            
            <View style={styles.divider} />
            
            <ProfileOption
              icon="chatbubble-ellipses-outline"
              title="Falar com Suporte"
              subtitle="Entre em contato conosco"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </View>

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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.backgroundLight,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.backgroundLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.medboxLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
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

export default ProfileScreen;