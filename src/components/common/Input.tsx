import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outline';
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  size = 'medium',
  variant = 'default',
  disabled = false,
  required = false,
  testID,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Size별 스타일
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          fontSize: 14,
          borderRadius: 8,
        };
      case 'large':
        return {
          height: 56,
          fontSize: 18,
          borderRadius: 14,
        };
      case 'medium':
      default:
        return {
          height: 48,
          fontSize: 16,
          borderRadius: 12,
        };
    }
  };

  // Variant별 스타일
  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.surface,
          borderColor: 'transparent',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.border,
          borderWidth: 1,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        };
    }
  };

  // Border 색상
  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  const iconSize = size === 'small' ? 18 : size === 'large' ? 24 : 20;

  // password 필드인 경우 자동으로 visibility 아이콘 추가
  const effectiveRightIcon = secureTextEntry
    ? isPasswordVisible
      ? 'visibility'
      : 'visibility-off'
    : rightIcon;

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <TextBox variant="body3" color={theme.text}>
            {label}
          </TextBox>
          {required && (
            <TextBox variant="body3" color={theme.error}>
              {' '}
              *
            </TextBox>
          )}
        </View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          getVariantStyle(),
          getSizeStyle(),
          {
            borderColor: getBorderColor(),
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={iconSize}
            color={theme.textSecondary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          testID={testID}
          editable={!disabled}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              fontSize: getSizeStyle().fontSize,
              color: theme.text,
              paddingLeft: leftIcon ? 0 : 14,
              paddingRight: effectiveRightIcon ? 0 : 14,
            },
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {/* Right Icon */}
        {effectiveRightIcon && (
          <Pressable
            onPress={handleRightIconPress}
            disabled={!secureTextEntry && !onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={effectiveRightIcon}
              size={iconSize}
              color={theme.textSecondary}
              style={styles.rightIcon}
            />
          </Pressable>
        )}
      </View>

      {/* Error or Helper Text */}
      {error ? (
        <TextBox
          variant="caption3"
          color={theme.error}
          style={styles.helperText}
        >
          {error}
        </TextBox>
      ) : helperText ? (
        <TextBox
          variant="caption3"
          color={theme.textSecondary}
          style={styles.helperText}
        >
          {helperText}
        </TextBox>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  helperText: {
    marginTop: 2,
  },
});

export default Input;
