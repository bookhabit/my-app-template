import { memo, useCallback, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

interface ListItem {
  id: string;
  title: string;
  description?: string;
}

export default function FlatListScreen() {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [data, setData] = useState<ListItem[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      title: `아이템 ${i + 1}`,
      description: `설명 ${i + 1}`,
    }))
  );
  const [horizontalData] = useState<ListItem[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: `h-item-${i}`,
      title: `카드 ${i + 1}`,
    }))
  );
  const [gridData] = useState<ListItem[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `grid-${i}`,
      title: `그리드 ${i + 1}`,
    }))
  );
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const [endReachedCount, setEndReachedCount] = useState(0);

  // 성능 테스트용 대용량 데이터
  const [largeData] = useState<ListItem[]>(
    Array.from({ length: 1000 }, (_, i) => ({
      id: `large-item-${i}`,
      title: `대용량 아이템 ${i + 1}`,
      description: `설명 ${i + 1}`,
    }))
  );

  // 성능 최적화 상태
  const [removeClippedSubviews, setRemoveClippedSubviews] = useState(false);
  const [maxToRenderPerBatch, setMaxToRenderPerBatch] = useState(10);
  const [initialNumToRender, setInitialNumToRender] = useState(10);
  const [windowSize, setWindowSize] = useState(21);

  const examples = [
    { id: 'basic', title: '기본' },
    { id: 'horizontal', title: '가로 스크롤' },
    { id: 'numColumns', title: '다중 컬럼' },
    { id: 'headerFooter', title: '헤더/푸터' },
    { id: 'empty', title: '빈 리스트' },
    { id: 'separator', title: '구분선' },
    { id: 'refresh', title: 'Pull-to-refresh' },
    { id: 'endReached', title: '무한스크롤' },
    { id: 'scrollToIndex', title: 'scrollToIndex' },
    { id: 'viewableItems', title: '가시성 감지' },
    { id: 'getItemLayout', title: 'getItemLayout' },
    { id: 'extraData', title: 'extraData' },
    { id: 'removeClippedSubviews', title: 'removeClippedSubviews' },
    { id: 'maxToRenderPerBatch', title: 'maxToRenderPerBatch' },
    { id: 'initialNumToRender', title: 'initialNumToRender' },
    { id: 'windowSize', title: 'windowSize' },
    { id: 'reactMemo', title: 'React.memo' },
    { id: 'useCallback', title: 'useCallback' },
  ];

  // React.memo 예제용 컴포넌트
  const MemoizedListItem = memo(
    ({ item }: { item: ListItem }) => {
      return (
        <View
          style={[styles.listItem, { backgroundColor: theme.primary + '20' }]}
        >
          <TextBox variant="body2" color={theme.text}>
            {item.title} (Memoized)
          </TextBox>
        </View>
      );
    },
    (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
  );

  // useCallback 예제용 renderItem
  const renderItemWithCallback = useCallback(
    ({ item }: { item: ListItem }) => {
      return (
        <View
          style={[styles.listItem, { backgroundColor: theme.secondary + '20' }]}
        >
          <TextBox variant="body2" color={theme.text}>
            {item.title} (useCallback)
          </TextBox>
        </View>
      );
    },
    [theme]
  );

  // 일반 renderItem (비교용)
  const renderItemNormal = useCallback(
    ({ item }: { item: ListItem }) => {
      return (
        <View
          style={[styles.listItem, { backgroundColor: theme.primary + '20' }]}
        >
          <TextBox variant="body2" color={theme.text}>
            {item.title} (Normal)
          </TextBox>
        </View>
      );
    },
    [theme]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { paddingBottom: 20 }]}>
        {/* 예제 선택 버튼 (가로 스크롤) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            예제 선택
          </TextBox>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonScrollContainer}
          >
            {examples.map((example) => (
              <CustomButton
                key={example.id}
                title={example.title}
                onPress={() =>
                  setActiveExample(
                    activeExample === example.id ? null : example.id
                  )
                }
                variant={activeExample === example.id ? 'primary' : 'outline'}
                size="small"
                style={styles.exampleButton}
              />
            ))}
          </ScrollView>
        </View>

        {/* 기본 FlatList 예제 */}
        {activeExample === 'basic' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              1. 기본 FlatList
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              data, renderItem, keyExtractor 필수
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 10)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
              />
            </View>
          </View>
        )}

        {/* horizontal FlatList 예제 */}
        {activeExample === 'horizontal' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              2. Horizontal FlatList (가로 스크롤)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              horizontal={true}로 가로 스크롤 활성화
            </TextBox>
            <FlatList
              data={horizontalData}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.horizontalItem,
                    { backgroundColor: theme.secondary + '40' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    {item.title}
                  </TextBox>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalContent}
            />
          </View>
        )}

        {/* numColumns 예제 */}
        {activeExample === 'numColumns' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              3. numColumns (다중 컬럼)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              numColumns로 그리드 레이아웃 생성
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={gridData}
                numColumns={2}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.gridItem,
                      { backgroundColor: theme.primary + '30' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                columnWrapperStyle={styles.columnWrapper}
              />
            </View>
          </View>
        )}

        {/* ListHeaderComponent / ListFooterComponent 예제 */}
        {activeExample === 'headerFooter' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              4. ListHeaderComponent / ListFooterComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              리스트 상단/하단에 컴포넌트 추가
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 5)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                ListHeaderComponent={
                  <View
                    style={[
                      styles.headerFooter,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox variant="body2" color="#FFFFFF">
                      헤더 컴포넌트
                    </TextBox>
                  </View>
                }
                ListFooterComponent={
                  <View
                    style={[
                      styles.headerFooter,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox variant="body2" color="#FFFFFF">
                      푸터 컴포넌트
                    </TextBox>
                  </View>
                }
              />
            </View>
          </View>
        )}

        {/* ListEmptyComponent 예제 */}
        {activeExample === 'empty' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              5. ListEmptyComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              리스트가 비었을 때 표시할 컴포넌트
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={[]}
                renderItem={() => null}
                keyExtractor={(item: ListItem) => item.id}
                style={styles.flatList}
                ListEmptyComponent={
                  <View
                    style={[
                      styles.emptyComponent,
                      { backgroundColor: theme.border + '40' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.textSecondary}>
                      리스트가 비어있습니다
                    </TextBox>
                  </View>
                }
              />
            </View>
          </View>
        )}

        {/* ItemSeparatorComponent 예제 */}
        {activeExample === 'separator' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              6. ItemSeparatorComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              아이템 사이 구분선 추가
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 5)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
              />
            </View>
          </View>
        )}

        {/* onRefresh / refreshing 예제 */}
        {activeExample === 'refresh' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              7. onRefresh (Pull-to-refresh)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              아래로 당겨서 새로고침
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 8)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setTimeout(() => {
                    setRefreshing(false);
                  }, 2000);
                }}
              />
            </View>
          </View>
        )}

        {/* onEndReached (인피니트 스크롤) 예제 */}
        {activeExample === 'endReached' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              8. onEndReached (인피니트 스크롤)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              스크롤 끝 도달 시 호출 (무한 스크롤)
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                onEndReached={() => {
                  setEndReachedCount((prev) => prev + 1);
                }}
                onEndReachedThreshold={0.5}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.statusText}
            >
              끝 도달 횟수: {endReachedCount}
            </TextBox>
          </View>
        )}

        {/* scrollToIndex / scrollToEnd 메서드 예제 */}
        {activeExample === 'scrollToIndex' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              9. scrollToIndex / scrollToEnd 메서드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ref를 사용하여 프로그래밍 방식으로 스크롤 제어
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="맨 위로"
                onPress={() => {
                  flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                  });
                }}
                variant="outline"
                size="small"
              />
              <CustomButton
                title="5번째로"
                onPress={() => {
                  flatListRef.current?.scrollToIndex({
                    index: 4,
                    animated: true,
                  });
                }}
                variant="outline"
                size="small"
              />
              <CustomButton
                title="맨 아래로"
                onPress={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
                variant="outline"
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                ref={flatListRef}
                data={data.slice(0, 10)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              getItemLayout을 사용하면 scrollToIndex가 더 정확하게 동작합니다
            </TextBox>
          </View>
        )}

        {/* onViewableItemsChanged 예제 */}
        {activeExample === 'viewableItems' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              10. onViewableItemsChanged (아이템 가시성)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              보이는 아이템 변화 감지
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 10)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: viewableItems.includes(item.id)
                          ? theme.primary + '40'
                          : theme.primary + '20',
                      },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                onViewableItemsChanged={({ viewableItems: items }) => {
                  setViewableItems(items.map((item) => item.item.id));
                }}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                }}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.statusText}
            >
              보이는 아이템: {viewableItems.join(', ') || '없음'}
            </TextBox>
          </View>
        )}

        {/* getItemLayout (성능 최적화) 예제 */}
        {activeExample === 'getItemLayout' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              11. getItemLayout (성능 최적화)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              고정 크기 아이템의 경우 성능 최적화 가능
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 15)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.fixedItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title} (고정 높이: 80px)
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                getItemLayout={(_, index) => ({
                  length: 80,
                  offset: 80 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              getItemLayout으로 고정 크기 아이템의 offset을 미리 계산
            </TextBox>
          </View>
        )}

        {/* extraData 예제 */}
        {activeExample === 'extraData' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              12. extraData (외부 상태 감지)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              PureComponent인 FlatList가 외부 상태 변화를 감지하게 함
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={data.slice(0, 5)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                extraData={refreshing}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              extraData가 변경되면 FlatList가 리렌더링됩니다
            </TextBox>
          </View>
        )}

        {/* removeClippedSubviews 예제 */}
        {activeExample === 'removeClippedSubviews' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              13. removeClippedSubviews (성능 최적화)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              화면 밖 뷰 제거로 FPS 개선 (Android 기본값: true, iOS 기본값:
              false)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title={removeClippedSubviews ? '비활성화' : '활성화'}
                onPress={() => setRemoveClippedSubviews(!removeClippedSubviews)}
                variant={removeClippedSubviews ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 200)}
                renderItem={renderItemNormal}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                removeClippedSubviews={removeClippedSubviews}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              {removeClippedSubviews
                ? '✅ 활성화: 화면 밖 뷰 제거로 메모리 절약'
                : '❌ 비활성화: 모든 뷰 유지 (메모리 사용 증가)'}
            </TextBox>
          </View>
        )}

        {/* maxToRenderPerBatch 예제 */}
        {activeExample === 'maxToRenderPerBatch' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              14. maxToRenderPerBatch (배치 렌더링)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              한 번에 렌더링할 아이템 수 (기본값: 10)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="5"
                onPress={() => setMaxToRenderPerBatch(5)}
                variant={maxToRenderPerBatch === 5 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="10 (기본)"
                onPress={() => setMaxToRenderPerBatch(10)}
                variant={maxToRenderPerBatch === 10 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="20"
                onPress={() => setMaxToRenderPerBatch(20)}
                variant={maxToRenderPerBatch === 20 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="50"
                onPress={() => setMaxToRenderPerBatch(50)}
                variant={maxToRenderPerBatch === 50 ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 300)}
                renderItem={renderItemNormal}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                maxToRenderPerBatch={maxToRenderPerBatch}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              현재 값: {maxToRenderPerBatch} | 작을수록 빈 공간 증가, 클수록 JS
              스레드 지연 가능
            </TextBox>
          </View>
        )}

        {/* initialNumToRender 예제 */}
        {activeExample === 'initialNumToRender' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              15. initialNumToRender (초기 렌더링)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              초기 렌더링 아이템 수 (기본값: 10)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="5"
                onPress={() => setInitialNumToRender(5)}
                variant={initialNumToRender === 5 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="10 (기본)"
                onPress={() => setInitialNumToRender(10)}
                variant={initialNumToRender === 10 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="20"
                onPress={() => setInitialNumToRender(20)}
                variant={initialNumToRender === 20 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="50"
                onPress={() => setInitialNumToRender(50)}
                variant={initialNumToRender === 50 ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 200)}
                renderItem={renderItemNormal}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                initialNumToRender={initialNumToRender}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              현재 값: {initialNumToRender} | 작을수록 초기 로딩 빠름, 클수록 빈
              공간 감소
            </TextBox>
          </View>
        )}

        {/* windowSize 예제 */}
        {activeExample === 'windowSize' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              16. windowSize (렌더링 창 크기)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              미리 렌더링할 창 크기 (기본값: 21)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="5"
                onPress={() => setWindowSize(5)}
                variant={windowSize === 5 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="10"
                onPress={() => setWindowSize(10)}
                variant={windowSize === 10 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="21 (기본)"
                onPress={() => setWindowSize(21)}
                variant={windowSize === 21 ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="50"
                onPress={() => setWindowSize(50)}
                variant={windowSize === 50 ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 300)}
                renderItem={renderItemNormal}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                windowSize={windowSize}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              현재 값: {windowSize} | 작을수록 메모리 절약, 클수록 빈 공간 감소
            </TextBox>
          </View>
        )}

        {/* React.memo 예제 */}
        {activeExample === 'reactMemo' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              17. React.memo (메모이제이션)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              props가 바뀌지 않으면 재렌더링 방지
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 200)}
                renderItem={({ item }) => <MemoizedListItem item={item} />}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              ✅ React.memo로 불필요한 재렌더링 방지 → 성능 향상
            </TextBox>
          </View>
        )}

        {/* useCallback 예제 */}
        {activeExample === 'useCallback' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              18. useCallback (함수 메모이제이션)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              renderItem을 useCallback으로 감싸서 함수 재생성 방지
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData.slice(0, 200)}
                renderItem={renderItemWithCallback}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                getItemLayout={(_, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              ✅ useCallback으로 함수 재생성 방지 → FlatList 최적화
              {'\n'}• renderItem을 useCallback으로 감싸면 컴포넌트 리렌더링
              시에도 함수가 재생성되지 않음
              {'\n'}• 익명 함수를 사용하면 매번 새로운 함수가 생성되어
              FlatList가 불필요하게 리렌더링될 수 있음
            </TextBox>
          </View>
        )}

        {/* 성능 최적화 요약 */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 FlatList 성능 최적화 요약
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              핵심 최적화 포인트
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              1. 한 번에 렌더링하는 아이템 수 조절
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              2. 초기 렌더링 수와 렌더링 창 크기 조절
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              3. 아이템 컴포넌트 단순화 & 메모이제이션
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              성능 관련 용어
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • VirtualizedList: 화면에 보이는 것만 렌더링
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • Viewport: 사용자가 실제로 보는 화면 부분
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • Window: 화면보다 넓게 잡아서 미리 렌더링
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • Blank areas: 아직 렌더링되지 않은 빈 영역
            </TextBox>
          </View>
        </View> */}

        {/* 성능 최적화 Props 비교표 */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📋 성능 최적화 Props 비교표
          </TextBox>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: theme.border }]}>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  Prop
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  기본값
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  역할
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  removeClippedSubviews
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  Android: true
                  {'\n'}iOS: false
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  화면 밖 뷰 제거
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  maxToRenderPerBatch
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  10
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  한 번에 렌더링할 아이템 수
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  initialNumToRender
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  10
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  초기 렌더링 아이템 수
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  windowSize
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  21
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  미리 렌더링할 창 크기
                </TextBox>
              </View>
            </View>
          </View>
        </View> */}

        {/* 실무 팁 */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 실무 최적화 팁
          </TextBox>
          <View style={styles.tipsContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 간단한 컴포넌트 사용: 로직/중첩이 많으면 렌더링 느려짐
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • React.memo 사용: props가 바뀌지 않으면 재렌더링 방지
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • useCallback 사용: renderItem에서 익명 함수 피하기
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • getItemLayout 사용: 고정 크기 아이템의 경우 필수
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 이미지 캐싱: FastImage 같은 라이브러리 활용
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • keyExtractor 필수: 아이템 구분 및 캐싱 최적화
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • removeClippedSubviews: Android에서는 기본값 true 유지 권장
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • windowSize 조절: 빈 공간이 많으면 증가, 메모리 부족하면 감소
            </TextBox>
          </View>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    flex: 1,
  },
  buttonScrollContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  exampleButton: {
    marginRight: 8,
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  listContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  flatList: {
    flex: 1,
  },
  listItem: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 8,
  },
  horizontalItem: {
    width: 150,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  horizontalContent: {
    paddingHorizontal: 16,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerFooter: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyComponent: {
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  statusText: {
    marginTop: 8,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  fixedItem: {
    padding: 16,
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
});
