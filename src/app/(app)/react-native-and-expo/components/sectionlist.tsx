import { useRef, useState } from 'react';
import { SectionList, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

interface SectionData {
  title: string;
  data: string[];
}

export default function SectionListScreen() {
  const { theme } = useTheme();
  const sectionListRef = useRef<SectionList>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const sections: SectionData[] = [
    {
      title: '과일',
      data: ['사과', '바나나', '오렌지', '포도', '딸기'],
    },
    {
      title: '채소',
      data: ['당근', '양파', '토마토', '상추', '오이'],
    },
    {
      title: '육류',
      data: ['소고기', '돼지고기', '닭고기', '양고기'],
    },
  ];

  const alphabetSections: SectionData[] = [
    {
      title: 'A',
      data: ['Apple', 'Ant', 'Airplane'],
    },
    {
      title: 'B',
      data: ['Banana', 'Bird', 'Book'],
    },
    {
      title: 'C',
      data: ['Cat', 'Car', 'Computer'],
    },
    {
      title: 'D',
      data: ['Dog', 'Door', 'Duck'],
    },
  ];

  const examples = [
    { id: 'basic', title: '기본' },
    { id: 'sticky', title: '고정 헤더' },
    { id: 'footer', title: '섹션 푸터' },
    { id: 'itemSeparator', title: '아이템 구분선' },
    { id: 'sectionSeparator', title: '섹션 구분선' },
    { id: 'refresh', title: 'Pull-to-refresh' },
    { id: 'scrollToLocation', title: 'scrollToLocation' },
    { id: 'headerFooter', title: '리스트 헤더/푸터' },
    { id: 'empty', title: '빈 리스트' },
    { id: 'extraData', title: 'extraData' },
    { id: 'contact', title: '연락처 리스트' },
  ];

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

        {/* 기본 SectionList 예제 */}
        {activeExample === 'basic' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              1. 기본 SectionList
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              sections, renderItem, renderSectionHeader 필수
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
              />
            </View>
          </View>
        )}

        {/* stickySectionHeadersEnabled 예제 */}
        {activeExample === 'sticky' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              2. stickySectionHeadersEnabled (고정 헤더)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              헤더를 상단에 고정 (iOS 기본값: true, Android 기본값: false)
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={alphabetSections}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
                stickySectionHeadersEnabled={true}
              />
            </View>
          </View>
        )}

        {/* renderSectionFooter 예제 */}
        {activeExample === 'footer' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              3. renderSectionFooter
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              각 섹션의 푸터 렌더링
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections.slice(0, 2)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                renderSectionFooter={({ section }) => (
                  <View
                    style={[
                      styles.sectionFooter,
                      { backgroundColor: theme.border + '40' },
                    ]}
                  >
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {section.data.length}개 항목
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
              />
            </View>
          </View>
        )}

        {/* ItemSeparatorComponent 예제 */}
        {activeExample === 'itemSeparator' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              4. ItemSeparatorComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              각 아이템 사이 구분선 추가
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections.slice(0, 2)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
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

        {/* SectionSeparatorComponent 예제 */}
        {activeExample === 'sectionSeparator' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              5. SectionSeparatorComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              각 섹션 위/아래에 separator 추가 (ItemSeparator와 다름)
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections.slice(0, 3)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
                SectionSeparatorComponent={() => (
                  <View
                    style={[
                      styles.sectionSeparator,
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
              6. onRefresh (Pull-to-refresh)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              아래로 당겨서 새로고침
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
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

        {/* scrollToLocation 메서드 예제 */}
        {activeExample === 'scrollToLocation' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              7. scrollToLocation 메서드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ref를 사용하여 특정 섹션/아이템으로 스크롤
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="섹션 0, 아이템 0"
                onPress={() => {
                  sectionListRef.current?.scrollToLocation({
                    sectionIndex: 0,
                    itemIndex: 0,
                    animated: true,
                  });
                }}
                variant="outline"
                size="small"
              />
              <CustomButton
                title="섹션 1, 아이템 2"
                onPress={() => {
                  sectionListRef.current?.scrollToLocation({
                    sectionIndex: 1,
                    itemIndex: 2,
                    animated: true,
                  });
                }}
                variant="outline"
                size="small"
              />
              <CustomButton
                title="섹션 2, 중앙"
                onPress={() => {
                  sectionListRef.current?.scrollToLocation({
                    sectionIndex: 2,
                    itemIndex: 0,
                    viewPosition: 0.5,
                    animated: true,
                  });
                }}
                variant="outline"
                size="small"
              />
            </View>
            <View style={styles.listContainer}>
              <SectionList
                ref={sectionListRef}
                sections={sections}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
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
              getItemLayout을 사용하면 scrollToLocation이 더 정확하게 동작합니다
            </TextBox>
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
              8. ListHeaderComponent / ListFooterComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              전체 리스트의 상단/하단에 컴포넌트 추가
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections.slice(0, 2)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.secondary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
                ListHeaderComponent={
                  <View
                    style={[
                      styles.listHeaderFooter,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox variant="body2" color="#FFFFFF">
                      전체 리스트 헤더
                    </TextBox>
                  </View>
                }
                ListFooterComponent={
                  <View
                    style={[
                      styles.listHeaderFooter,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <TextBox variant="body2" color="#FFFFFF">
                      전체 리스트 푸터
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
              9. ListEmptyComponent
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              섹션이 완전히 비었을 때 표시할 컴포넌트
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={[]}
                renderItem={() => null}
                renderSectionHeader={() => null}
                keyExtractor={(item: string) => item}
                style={styles.sectionList}
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

        {/* extraData 예제 */}
        {activeExample === 'extraData' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              10. extraData (외부 상태 감지)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              PureComponent인 SectionList가 외부 상태 변화를 감지하게 함
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sections.slice(0, 2)}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.sectionHeader,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <TextBox
                      variant="body2"
                      color="#FFFFFF"
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
                extraData={refreshing}
              />
            </View>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              extraData가 변경되면 SectionList가 리렌더링됩니다
            </TextBox>
          </View>
        )}

        {/* 실무 패턴: 연락처 리스트 */}
        {activeExample === 'contact' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              11. 실무 패턴: 연락처 리스트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              알파벳별로 그룹화된 연락처 리스트
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={alphabetSections}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item}
                    </TextBox>
                  </View>
                )}
                renderSectionHeader={({ section }) => (
                  <View
                    style={[
                      styles.contactHeader,
                      { backgroundColor: theme.border + '60' },
                    ]}
                  >
                    <TextBox
                      variant="body3"
                      color={theme.text}
                      style={styles.headerText}
                    >
                      {section.title}
                    </TextBox>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.sectionList}
                stickySectionHeadersEnabled={true}
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
  sectionList: {
    flex: 1,
  },
  listItem: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 4,
  },
  sectionHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '600',
  },
  sectionFooter: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'flex-end',
    marginTop: 4,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  sectionSeparator: {
    height: 2,
    marginVertical: 8,
  },
  listHeaderFooter: {
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
  contactItem: {
    padding: 16,
    borderBottomWidth: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  contactHeader: {
    padding: 8,
    paddingLeft: 16,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
