import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

export default function NfcAnimation({ status = 'idle', size = 200 }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (status === 'scanning') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            animateRing(ring1, 0),
            Animated.delay(200),
          ]),
          Animated.parallel([
            animateRing(ring2, 0),
            Animated.delay(200),
          ]),
          animateRing(ring3, 0),
          Animated.delay(400),
        ])
      );

      const glowPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      );

      pulse.start();
      glowPulse.start();

      return () => {
        pulse.stop();
        glowPulse.stop();
        ring1.setValue(0);
        ring2.setValue(0);
        ring3.setValue(0);
        glow.setValue(0.4);
      };
    }

    if (status === 'success') {
      Animated.spring(glow, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [status]);

  function animateRing(anim, fromValue) {
    anim.setValue(fromValue);
    return Animated.timing(anim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    });
  }

  const ringColor =
    status === 'success' ? colors.success : status === 'error' ? colors.error : colors.accent;

  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {[ring1, ring2, ring3].map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size * (0.5 + i * 0.2),
              height: size * (0.5 + i * 0.2),
              borderRadius: size * (0.25 + i * 0.1),
              borderColor: ringColor,
              position: 'absolute',
              top: center - (size * (0.25 + i * 0.1)),
              left: center - (size * (0.25 + i * 0.1)),
              opacity: anim.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0.7, 0.5, 0],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.4],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: size * 0.19,
            backgroundColor: ringColor + '22',
            borderColor: ringColor,
            opacity: glow,
          },
        ]}
      >
        <Animated.Text style={[styles.icon, { opacity: glow }]}>
          {status === 'success' ? '✓' : status === 'error' ? '✗' : '📡'}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 1.5,
  },
  core: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
});
