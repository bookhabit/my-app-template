import { View, StyleSheet, Pressable } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

interface TodoFilterSectionProps {
  filter: 'all' | 'active' | 'completed';
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  onClearCompleted: () => void;
}

/**
 * Todo 필터 섹션 컴포넌트
 * - 전체/진행중/완료 필터 버튼
 * - 완료된 항목 모두 삭제 버튼
 * - 재사용 가능한 공통 컴포넌트
 */
export function TodoFilterSection({
  filter,
  totalCount,
  activeCount,
  completedCount,
  onFilterChange,
  onClearCompleted,
}: TodoFilterSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => onFilterChange('all')}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === 'all' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <TextBox
            variant="button4"
            color={filter === 'all' ? '#FFFFFF' : theme.text}
          >
            전체 ({totalCount})
          </TextBox>
        </Pressable>
        <Pressable
          onPress={() => onFilterChange('active')}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === 'active' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <TextBox
            variant="button4"
            color={filter === 'active' ? '#FFFFFF' : theme.text}
          >
            진행중 ({activeCount})
          </TextBox>
        </Pressable>
        <Pressable
          onPress={() => onFilterChange('completed')}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === 'completed' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <TextBox
            variant="button4"
            color={filter === 'completed' ? '#FFFFFF' : theme.text}
          >
            완료 ({completedCount})
          </TextBox>
        </Pressable>
      </View>

      {completedCount > 0 && (
        <CustomButton
          title="완료된 항목 모두 삭제"
          onPress={onClearCompleted}
          variant="outline"
          size="small"
          style={styles.clearButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
});

