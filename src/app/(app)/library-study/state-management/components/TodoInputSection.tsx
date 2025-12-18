import { View, StyleSheet } from 'react-native';

import { Input } from '@/components/common/Input';
import { CustomButton } from '@/components/common/button';

interface TodoInputSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onAddTodo: () => void;
}

/**
 * Todo 입력 섹션 컴포넌트
 * - Input과 추가 버튼을 포함
 * - 재사용 가능한 공통 컴포넌트
 */
export function TodoInputSection({
  inputText,
  onInputChange,
  onAddTodo,
}: TodoInputSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.inputContainer}>
        <Input
          placeholder="할 일을 입력하세요..."
          value={inputText}
          onChangeText={onInputChange}
          onSubmitEditing={onAddTodo}
          returnKeyType="done"
          style={styles.input}
        />
        <CustomButton
          title="추가"
          onPress={onAddTodo}
          variant="primary"
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
});

