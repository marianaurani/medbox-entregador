// src/screens/auth/CNHUploadScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'CNHUpload'>;

const CNHUploadScreen: React.FC<Props> = ({ navigation }) => {
  const [cnhPhoto, setCnhPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para fotografar sua CNH'
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à galeria para escolher a foto da CNH'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.9,
      });

      if (!result.canceled) {
        setCnhPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.9,
      });

      if (!result.canceled) {
        setCnhPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a foto');
    }
  };

  const handleContinue = async () => {
    if (!cnhPhoto) {
      Alert.alert('Atenção', 'Por favor, adicione uma foto da sua CNH');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigation.navigate('RegistrationComplete');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar a foto da CNH');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

      {/* ✅ HEADER PADRONIZADO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foto da CNH</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Conteúdo com Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview da CNH */}
        <View style={styles.photoContainer}>
          {cnhPhoto ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: cnhPhoto }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setCnhPhoto(null)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={32} color={colors.error || '#F44336'} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="card" size={60} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>CNH</Text>
            </View>
          )}
        </View>

        {/* ✅ TÍTULO PADRONIZADO */}
        <Text style={styles.title}>Adicione uma foto da sua CNH</Text>
        <Text style={styles.subtitle}>
          Fotografe sua CNH aberta. Certifique-se de que todos os dados estejam legíveis e a foto esteja nítida.
        </Text>

        {/* Botões de ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="camera" size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionButtonText}>Fotografar CNH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChooseFromGallery}
            disabled={loading}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="images" size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionButtonText}>Escolher da galeria</Text>
          </TouchableOpacity>
        </View>

        {/* Aviso importante */}
        <View style={styles.warningContainer}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.warningText}>
            Sua CNH precisa estar válida e dentro do prazo de validade
          </Text>
        </View>

        {/* Dicas */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dicas para uma boa foto:</Text>
          <Text style={styles.tip}>✓ CNH aberta (frente e verso visíveis)</Text>
          <Text style={styles.tip}>✓ Todos os dados legíveis</Text>
          <Text style={styles.tip}>✓ Boa iluminação, sem reflexos</Text>
          <Text style={styles.tip}>✓ Foto nítida e sem cortes</Text>
        </View>

        {/* Espaço extra */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ✅ FOOTER E BOTÃO PADRONIZADOS */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !cnhPhoto) && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || !cnhPhoto}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Finalizar cadastro</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  // ✅ HEADER PADRONIZADO
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundLight,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  photoWrapper: {
    position: 'relative',
  },
  placeholderContainer: {
    width: 280,
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  photoPreview: {
    width: 280,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
  },
  // ✅ TÍTULO PADRONIZADO
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  // ✅ FOOTER PADRONIZADO
  footer: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // ✅ BOTÃO PADRONIZADO
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default CNHUploadScreen;