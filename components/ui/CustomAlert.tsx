import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'Ya',
  cancelText = 'Batal'
}: CustomAlertProps) {
  
  if (!visible) return null;

  let iconColor = Colors.light.primary;
  let IconComponent = Info;
  let btnColor = Colors.light.primary;

  switch (type) {
    case 'success':
      iconColor = '#16A34A';
      btnColor = '#16A34A';
      IconComponent = CheckCircle;
      break;
    case 'error':
      iconColor = '#DC2626';
      btnColor = '#DC2626';
      IconComponent = XCircle;
      break;
    case 'warning':
      iconColor = '#D97706';
      btnColor = '#D97706';
      IconComponent = AlertCircle;
      break;
    default:
      iconColor = Colors.light.primary;
      btnColor = Colors.light.primary;
      IconComponent = Info;
      break;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          
          <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
            <IconComponent size={32} color={iconColor} strokeWidth={2} />
          </View>

          <Text style={styles.title}>{title || (type === 'error' ? 'Gagal' : 'Info')}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity 
                style={[styles.button, styles.btnCancel]} 
                onPress={onClose}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.btnConfirm, { backgroundColor: btnColor }]} 
              onPress={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
            >
              <Text style={styles.btnConfirmText}>
                {onConfirm ? confirmText : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F3F4F6',
  },
  btnConfirm: {
  },
  btnCancelText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#687076',
    fontSize: 14,
  },
  btnConfirmText: {
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
    fontSize: 14,
  },
});