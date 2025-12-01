import { useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';
import { FlashList } from '@shopify/flash-list';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

interface Item {
  id: string;
  title: string;
  description: string;
}

const generateData = (count: number): Item[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `아이템 ${i + 1}`,
    description: `이것은 ${i + 1}번째 아이템의 설명입니다.`,
  }));
};

export default function FlashListScreen() {
  const { theme } = useTheme();

  // State
  const [data, setData] = useState<Item[]>(generateData(1000));
  const [estimatedItemSize, setEstimatedItemSize] = useState(100);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => {
      return (
        <View
          style={[
            styles.item,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <TextBox variant="title4" color={theme.text} style={styles.itemTitle}>
            {item.title}
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.itemDescription}
          >
            {item.description}
          </TextBox>
        </View>
      );
    },
    [theme]
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const getItemType = useCallback(() => {
    return 'item';
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: top },
      ]}
    >
      <CustomHeader title="FlashList" showBackButton />
      <View style={[styles.listContainer, { paddingBottom: 0 }]}>
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={estimatedItemSize}
          getItemType={getItemType}
          numColumns={1}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  item: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemTitle: {
    marginBottom: 8,
  },
  itemDescription: {
    lineHeight: 20,
  },
});
