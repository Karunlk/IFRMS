import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const showToast = useCallback(
    (msg, kind = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      setType(kind);
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 3000);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toast,
            type === 'error' ? styles.error : styles.success,
            { opacity },
          ]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 12,
    zIndex: 999,
  },
  success: { backgroundColor: '#10b981' },
  error: { backgroundColor: '#ef4444' },
  text: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 },
});
