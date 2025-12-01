import React from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightPress?: () => void;
  rightText?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * CustomHeader
 *
 * SafeArea를 고려한 커스텀 헤더
 * - 자동 SafeArea top padding
 * - 뒤로가기 버튼
 * - 제목 (가운데 정렬)
 * - 오른쪽 아이콘 또는 텍스트 버튼
 * - 테마 자동 적용
 */
export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightIcon,
  onRightPress,
  rightText,
  backgroundColor,
  style,
}) => {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || theme.background,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View style={styles.content}>
        {/* Left: Back Button */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
          )}
        </View>

        {/* Center: Title */}
        <View style={styles.centerContainer}>
          {title && (
            <TextBox
              variant="body1"
              color={theme.text}
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </TextBox>
          )}
        </View>

        {/* Right: Icon or Text Button */}
        <View style={styles.rightContainer}>
          {rightIcon && onRightPress && (
            <Pressable
              onPress={onRightPress}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name={rightIcon} size={24} color={theme.text} />
            </Pressable>
          )}
          {rightText && onRightPress && (
            <Pressable
              onPress={onRightPress}
              style={({ pressed }) => [
                styles.textButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <TextBox variant="button3" color={theme.primary}>
                {rightText}
              </TextBox>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  textButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  title: {
    textAlign: 'center',
  },
});

export default CustomHeader;
