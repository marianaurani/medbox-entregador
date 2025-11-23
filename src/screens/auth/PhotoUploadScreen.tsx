// src/screens/auth/PhotoUploadScreen.tsx
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

type Props = NativeStackScreenProps<AuthStackParamList, 'PhotoUpload'>;

const PhotoUploadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { vehicleType } = route.params;
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requiresCNH = vehicleType === 'moto' || vehicleType === 'carro';

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para tirar sua foto'
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
        'Precisamos de acesso à galeria para escolher uma foto'
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a foto');
    }
  };

  const handleContinue = async () => {
    if (!photo) {
      Alert.alert('Atenção', 'Por favor, adicione uma foto do seu rosto');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ✅ CORRIGIDO - Bike vai para IDUpload, Moto/Carro vai para CNHUpload
      if (requiresCNH) {
        navigation.navigate('CNHUpload', { vehicleType });
      } else {
        // ✅ Bike agora vai para upload de identidade
        navigation.navigate('IDUpload', { vehicleType });
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar a foto');
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
        <Text style={styles.headerTitle}>Foto do rosto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview da foto */}
        <View style={styles.photoContainer}>
          {photo ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhoto(null)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={32} color={colors.error || '#F44336'} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="person" size={80} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* ✅ TÍTULO PADRONIZADO */}
        <Text style={styles.title}>Adicione uma foto do seu rosto</Text>
        <Text style={styles.subtitle}>
          Tire uma selfie ou escolha uma foto recente da galeria. Certifique-se de que seu rosto
          esteja bem visível e iluminado.
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
            <Text style={styles.actionButtonText}>Tirar foto</Text>
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

        {/* Dicas */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dicas para uma boa foto:</Text>
          <Text style={styles.tip}>✓ Tire sem óculos escuros ou chapéu</Text>
          <Text style={styles.tip}>✓ Use boa iluminação</Text>
          <Text style={styles.tip}>✓ Mantenha o rosto centralizado</Text>
          <Text style={styles.tip}>✓ Não use filtros</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ✅ FOOTER PADRONIZADO */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !photo) && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || !photo}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
  },
  // ✅ TÍTULO PADRONIZADO
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
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  tipsContainer: {
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 8,
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

export default PhotoUploadScreen;