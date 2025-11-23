// src/screens/auth/IDUploadScreen.tsx
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

type Props = NativeStackScreenProps<AuthStackParamList, 'IDUpload'>;

const IDUploadScreen: React.FC<Props> = ({ navigation }) => {
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para fotografar seu documento'
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
        'Precisamos de acesso à galeria para escolher a foto do documento'
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
        setIdPhoto(result.assets[0].uri);
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
        setIdPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a foto');
    }
  };

  const handleContinue = async () => {
    if (!idPhoto) {
      Alert.alert('Atenção', 'Por favor, adicione uma foto do seu documento');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigation.navigate('RegistrationComplete');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar a foto do documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foto do documento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview do documento */}
        <View style={styles.photoContainer}>
          {idPhoto ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: idPhoto }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setIdPhoto(null)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={32} color={colors.error || '#F44336'} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="document-text" size={60} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>RG ou CPF</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>Adicione uma foto do seu documento</Text>
        <Text style={styles.subtitle}>
          Fotografe seu RG ou CPF com foto. Certifique-se de que todos os dados estejam legíveis
          e a foto esteja nítida.
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
            <Text style={styles.actionButtonText}>Fotografar documento</Text>
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
            Aceitamos RG ou CPF com foto dentro do prazo de validade
          </Text>
        </View>

        {/* Dicas */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dicas para uma boa foto:</Text>
          <Text style={styles.tip}>✓ Documento completo e legível</Text>
          <Text style={styles.tip}>✓ Todos os dados visíveis</Text>
          <Text style={styles.tip}>✓ Boa iluminação, sem reflexos</Text>
          <Text style={styles.tip}>✓ Foto nítida e sem cortes</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !idPhoto) && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || !idPhoto}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
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
  footer: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
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

export default IDUploadScreen;