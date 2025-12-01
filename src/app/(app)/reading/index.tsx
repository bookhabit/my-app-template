import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import { getAllBooks, deleteBook, type Book } from '@/db/readingRepository';

import TextBox from '@/components/common/TextBox';
import { CustomHeader } from '@/components/layout/CustomHeader';

const readingColors = {
  primary: '#06B6D4', // 청록색 (Cyan)
  secondary: '#0891B2', // 진한 청록색
  accent: '#22D3EE', // 밝은 청록색
  gradient1: ['#06B6D4', '#0891B2'],
  gradient2: ['#22D3EE', '#06B6D4'],
};

export default function ReadingListScreen() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllBooks(searchQuery);
      setBooks(result);
    } catch (error) {
      console.error('책 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // 화면 포커스 시 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const handleDeleteBook = async (bookId: number) => {
    try {
      await deleteBook(bookId);
      await loadBooks();
    } catch (error) {
      console.error('책 삭제 실패:', error);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <Pressable
      style={[
        styles.bookItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={() => router.push(`/(app)/reading/${item.id}`)}
    >
      <View style={styles.bookItemContent}>
        <TextBox variant="body2" color={theme.text} style={styles.bookTitle}>
          {item.title}
        </TextBox>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteBook(item.id);
          }}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.error} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <CustomHeader title="독서 기록" />

      {/* 검색 바 */}
      <View style={[styles.searchContainer]}>
        <View style={[styles.searchInputContainer]}>
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="책 제목으로 검색..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons
                name="close"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* 책 목록 */}
      {loading ? (
        <View style={styles.emptyState}>
          <TextBox variant="body3" color={theme.textSecondary}>
            로딩 중...
          </TextBox>
        </View>
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="menu-book"
            size={64}
            color={theme.textSecondary}
          />
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.emptyText}
          >
            {searchQuery ? '검색 결과가 없습니다' : '읽은 책을 추가해보세요'}
          </TextBox>
        </View>
      )}

      {/* + 버튼 */}
      <Pressable
        style={[
          styles.fab,
          { backgroundColor: readingColors.primary, bottom: 20 },
        ]}
        onPress={() => router.push('/(app)/reading/edit')}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,

    borderColor: '#06B6D440',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bookItem: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  bookItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookTitle: {
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
