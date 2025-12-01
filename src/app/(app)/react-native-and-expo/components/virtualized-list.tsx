import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, VirtualizedList, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

interface ListItem {
  id: string;
  title: string;
}

export default function VirtualizedListScreen() {
  const { theme } = useTheme();
  const virtualizedListRef = useRef<VirtualizedList<ListItem>>(null);
  const [extraDataValue, setExtraDataValue] = useState(0);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const examples = [
    { id: 'basic', title: '기본' },
    { id: 'extraData', title: 'extraData' },
    { id: 'getItemLayout', title: 'getItemLayout' },
    { id: 'scrollToIndex', title: 'scrollToIndex' },
    { id: 'nonArray', title: '비배열 데이터' },
  ];

  // 일반 배열 데이터
  const arrayData: ListItem[] = Array.from({ length: 30 }, (_, i) => ({
    id: `item-${i}`,
    title: `아이템 ${i + 1}`,
  }));

  // 비배열 데이터 (Map 구조 시뮬레이션)
  const mapData = {
    items: arrayData,
    metadata: { total: arrayData.length, version: '1.0' },
  };

  // getItem 함수
  const getItem = (data: typeof mapData, index: number): ListItem => {
    return data.items[index];
  };

  // getItemCount 함수
  const getItemCount = (data: typeof mapData): number => {
    return data.items.length;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { paddingBottom: 20 }]}>
        {/* VirtualizedList란? */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            VirtualizedList란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • FlatList/SectionList의 기반(Base) 컴포넌트
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 매우 큰 리스트를 효율적으로 렌더링하기 위한 가상화 리스트
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 화면에 보이는 영역 + 주변 몇 개만 렌더링
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • PureComponent → extraData 필요
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 일반적으로 직접 사용할 일은 거의 없음
            </TextBox>
          </View>
        </View> */}

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

        {/* 기본 VirtualizedList 예제 */}
        {activeExample === 'basic' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.exampleHeader}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                1. 기본 VirtualizedList
              </TextBox>
              <CustomButton
                title={activeExample === 'basic' ? '숨기기' : '보기'}
                onPress={() =>
                  setActiveExample(activeExample === 'basic' ? null : 'basic')
                }
                variant={activeExample === 'basic' ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              필수 props: data, getItem, getItemCount
            </TextBox>
            {activeExample === 'basic' && (
              <View style={styles.listContainer}>
                <VirtualizedList
                  data={mapData}
                  initialNumToRender={5}
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
                  getItem={getItem}
                  getItemCount={getItemCount}
                  style={styles.virtualizedList}
                />
              </View>
            )}
          </View>
        )}

        {/* extraData 예제 */}
        {activeExample === 'extraData' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.exampleHeader}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                2. extraData (외부 상태 감지)
              </TextBox>
              <CustomButton
                title={activeExample === 'extraData' ? '숨기기' : '보기'}
                onPress={() =>
                  setActiveExample(
                    activeExample === 'extraData' ? null : 'extraData'
                  )
                }
                variant={activeExample === 'extraData' ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              PureComponent이므로 외부 상태 변경을 감지하려면 extraData 필수
            </TextBox>
            {activeExample === 'extraData' && (
              <>
                <CustomButton
                  title="extraData 변경"
                  onPress={() => setExtraDataValue((prev) => prev + 1)}
                  variant="outline"
                  size="small"
                />
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.statusText}
                >
                  extraData 값: {extraDataValue}
                </TextBox>
                <View style={styles.listContainer}>
                  <VirtualizedList
                    data={mapData}
                    initialNumToRender={5}
                    renderItem={({ item }) => (
                      <View
                        style={[
                          styles.listItem,
                          {
                            backgroundColor:
                              extraDataValue % 2 === 0
                                ? theme.primary + '20'
                                : theme.secondary + '20',
                          },
                        ]}
                      >
                        <TextBox variant="body2" color={theme.text}>
                          {item.title} (extraData: {extraDataValue})
                        </TextBox>
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                    getItem={getItem}
                    getItemCount={getItemCount}
                    style={styles.virtualizedList}
                    extraData={extraDataValue}
                  />
                </View>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.infoText}
                >
                  extraData가 변경되면 VirtualizedList가 리렌더링됩니다
                </TextBox>
              </>
            )}
          </View>
        )}

        {/* getItemLayout 예제 */}
        {activeExample === 'getItemLayout' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.exampleHeader}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                3. getItemLayout (성능 최적화)
              </TextBox>
              <CustomButton
                title={activeExample === 'getItemLayout' ? '숨기기' : '보기'}
                onPress={() =>
                  setActiveExample(
                    activeExample === 'getItemLayout' ? null : 'getItemLayout'
                  )
                }
                variant={
                  activeExample === 'getItemLayout' ? 'primary' : 'outline'
                }
                size="small"
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              고정 크기 아이템의 offset을 미리 계산하여 성능 최적화
            </TextBox>
            {activeExample === 'getItemLayout' && (
              <View style={styles.listContainer}>
                <VirtualizedList
                  data={mapData}
                  initialNumToRender={5}
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
                  getItem={getItem}
                  getItemCount={getItemCount}
                  style={styles.virtualizedList}
                  getItemLayout={(data, index) => ({
                    length: 80,
                    offset: 80 * index,
                    index,
                  })}
                />
              </View>
            )}
          </View>
        )}

        {/* scrollToIndex 메서드 예제 */}
        {activeExample === 'scrollToIndex' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.exampleHeader}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                4. scrollToIndex 메서드
              </TextBox>
              <CustomButton
                title={activeExample === 'scrollToIndex' ? '숨기기' : '보기'}
                onPress={() =>
                  setActiveExample(
                    activeExample === 'scrollToIndex' ? null : 'scrollToIndex'
                  )
                }
                variant={
                  activeExample === 'scrollToIndex' ? 'primary' : 'outline'
                }
                size="small"
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ref를 사용하여 프로그래밍 방식으로 스크롤 제어
            </TextBox>
            {activeExample === 'scrollToIndex' && (
              <>
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="맨 위로"
                    onPress={() => {
                      virtualizedListRef.current?.scrollToIndex({
                        index: 0,
                        animated: true,
                      });
                    }}
                    variant="outline"
                    size="small"
                  />
                  <CustomButton
                    title="10번째로"
                    onPress={() => {
                      virtualizedListRef.current?.scrollToIndex({
                        index: 9,
                        animated: true,
                      });
                    }}
                    variant="outline"
                    size="small"
                  />
                  <CustomButton
                    title="맨 아래로"
                    onPress={() => {
                      virtualizedListRef.current?.scrollToEnd({
                        animated: true,
                      });
                    }}
                    variant="outline"
                    size="small"
                  />
                </View>
                <View style={styles.listContainer}>
                  <VirtualizedList
                    ref={virtualizedListRef}
                    data={mapData}
                    initialNumToRender={5}
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
                    getItem={getItem}
                    getItemCount={getItemCount}
                    style={styles.virtualizedList}
                    getItemLayout={(data, index) => ({
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
                  getItemLayout을 사용하면 scrollToIndex가 더 정확하게
                  동작합니다
                </TextBox>
              </>
            )}
          </View>
        )}

        {/* 비배열 데이터 예제 */}
        {activeExample === 'nonArray' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.exampleHeader}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                6. 비배열 데이터 처리
              </TextBox>
              <CustomButton
                title={activeExample === 'nonArray' ? '숨기기' : '보기'}
                onPress={() =>
                  setActiveExample(
                    activeExample === 'nonArray' ? null : 'nonArray'
                  )
                }
                variant={activeExample === 'nonArray' ? 'primary' : 'outline'}
                size="small"
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              Map, Graph 구조 등 배열이 아닌 데이터도 처리 가능
            </TextBox>
            {activeExample === 'nonArray' && (
              <>
                <View style={styles.listContainer}>
                  <VirtualizedList
                    data={mapData}
                    initialNumToRender={5}
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
                        <TextBox variant="body4" color={theme.textSecondary}>
                          메타데이터: {mapData.metadata.version}
                        </TextBox>
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                    getItem={getItem}
                    getItemCount={getItemCount}
                    style={styles.virtualizedList}
                  />
                </View>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.infoText}
                >
                  FlatList는 배열만 받지만, VirtualizedList는
                  getItem/getItemCount로 비배열 데이터도 처리 가능
                </TextBox>
              </>
            )}
          </View>
        )}

        {/* 성능 최적화 Props */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. 성능 최적화 Props
          </TextBox>
          <View style={styles.optimizationContainer}>
            <View style={styles.optimizationItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.optimizationTitle}
              >
                initialNumToRender
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                초기 렌더링 아이템 수 (기본값: 10)
              </TextBox>
            </View>

            <View style={styles.optimizationItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.optimizationTitle}
              >
                maxToRenderPerBatch
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                한 번에 렌더하는 추가 배치량
              </TextBox>
            </View>

            <View style={styles.optimizationItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.optimizationTitle}
              >
                windowSize
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                렌더링 window 크기 (기본값: 21)
              </TextBox>
            </View>

            <View style={styles.optimizationItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.optimizationTitle}
              >
                removeClippedSubviews
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                화면 밖 뷰 제거 (Android 기본값: true)
              </TextBox>
            </View>
          </View>
        </View> */}

        {/* 언제 사용해야 하나? */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎯 언제 VirtualizedList를 사용해야 하나?
          </TextBox>
          <View style={styles.usageContainer}>
            <View
              style={[
                styles.usageBox,
                {
                  backgroundColor: theme.error + '20',
                  borderColor: theme.error,
                },
              ]}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.usageTitle}
              >
                ❌ 사용하지 말아야 할 경우
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 일반 배열 리스트 → FlatList 사용
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 섹션이 있는 리스트 → SectionList 사용
              </TextBox>
            </View>

            <View
              style={[
                styles.usageBox,
                {
                  backgroundColor: theme.primary + '20',
                  borderColor: theme.primary,
                },
              ]}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.usageTitle}
              >
                ✅ 사용해야 할 경우
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 데이터가 배열이 아님 (Map, Graph 구조)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 매우 커스텀한 리스트 구조
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • getItem/getItemCount 형태가 필요한 경우
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 완전한 커스텀 최적화가 필요할 때
              </TextBox>
            </View>
          </View>
        </View> */}

        {/* 핵심 요약 */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 핵심 요약
          </TextBox>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                VirtualizedList
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                FlatList의 기반이 되는 low-level 리스트
              </TextBox>
            </View>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                필수 props
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                data, getItem, getItemCount
              </TextBox>
            </View>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                장점
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                고성능, 대용량 최적화, 비배열 데이터 지원
              </TextBox>
            </View>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                단점
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                구현 복잡, 대부분 FlatList면 충분
              </TextBox>
            </View>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                extraData
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                UI 업데이트를 위해 거의 필수
              </TextBox>
            </View>
            <View style={styles.summaryRow}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.summaryLabel}
              >
                사용 케이스
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                비배열 데이터/완전 커스텀 리스트
              </TextBox>
            </View>
          </View>
        </View> */}

        {/* 주의사항 */}
        {/* <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항
          </TextBox>
          <View style={styles.warningContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • PureComponent이므로 extraData 없이 외부 상태 변경 반영 안 됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 빠르게 스크롤할 때 약간의 "빈 화면"이 잠시 보일 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 리스트가 렌더링 window 밖으로 사라지면 내부 state 유지 안 됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모든 정보는 외부 저장소(Redux, Zustand 등)에 넣어야 안전
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 일반적으로 FlatList로 충분하므로 직접 사용은 특수한 경우만
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
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  listContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  virtualizedList: {
    flex: 1,
  },
  listItem: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 8,
  },
  fixedItem: {
    padding: 16,
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    marginBottom: 8,
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
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  comparisonItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  comparisonTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  optimizationContainer: {
    gap: 12,
  },
  optimizationItem: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  optimizationTitle: {
    fontWeight: '600',
  },
  usageContainer: {
    gap: 12,
  },
  usageBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  usageTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  usageItem: {
    marginLeft: 8,
    lineHeight: 20,
  },
  summaryContainer: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  summaryLabel: {
    fontWeight: '600',
    minWidth: 120,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
