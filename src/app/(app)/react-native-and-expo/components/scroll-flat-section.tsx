import { useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

interface ListItem {
  id: string;
  title: string;
}

interface SectionData {
  title: string;
  data: string[];
}

export default function ScrollFlatSectionScreen() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'scroll' | 'flat' | 'section'>(
    'scroll'
  );
  const [refreshing, setRefreshing] = useState(false);

  // 작은 데이터 (ScrollView용)
  const smallData: ListItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: `small-${i}`,
    title: `아이템 ${i + 1}`,
  }));

  // 큰 데이터 (FlatList/SectionList용)
  const largeData: ListItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `large-${i}`,
    title: `아이템 ${i + 1}`,
  }));

  // 섹션 데이터 (SectionList용)
  const sectionData: SectionData[] = [
    {
      title: '과일',
      data: ['사과', '바나나', '오렌지', '포도', '딸기', '수박', '참외'],
    },
    {
      title: '채소',
      data: ['당근', '양파', '토마토', '상추', '오이', '배추', '무'],
    },
    {
      title: '육류',
      data: ['소고기', '돼지고기', '닭고기', '양고기', '오리고기'],
    },
    {
      title: '해산물',
      data: ['생선', '새우', '게', '오징어', '문어', '전복'],
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          ScrollView vs FlatList vs SectionList
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          세 컴포넌트의 차이점과 사용 시기를 비교해보세요
        </TextBox>

        {/* 비교표 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 비교표
          </TextBox>
          <View style={styles.comparisonTable}>
            <View style={styles.tableRow}>
              <View
                style={[styles.tableHeader, { backgroundColor: theme.border }]}
              >
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableCell}
                >
                  항목
                </TextBox>
              </View>
              <View
                style={[styles.tableHeader, { backgroundColor: theme.border }]}
              >
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableCell}
                >
                  ScrollView
                </TextBox>
              </View>
              <View
                style={[styles.tableHeader, { backgroundColor: theme.border }]}
              >
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableCell}
                >
                  FlatList
                </TextBox>
              </View>
              <View
                style={[styles.tableHeader, { backgroundColor: theme.border }]}
              >
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableCell}
                >
                  SectionList
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  가상화
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.error}>
                  ❌ 없음
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ 있음
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ 있음
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  성능
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.error}>
                  낮음
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  높음
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  높음
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  데이터 형태
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  단순 배열
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  단순 배열
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  섹션 구조
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  적합한 데이터량
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  30개 이하
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  50개 이상
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  50개 이상
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  Pull To Refresh
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  직접 구현
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ 내장
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ 내장
                </TextBox>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.text}>
                  무한스크롤
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.error}>
                  ❌
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ onEndReached
                </TextBox>
              </View>
              <View
                style={[styles.tableCell, { backgroundColor: theme.surface }]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  ✔ onEndReached
                </TextBox>
              </View>
            </View>
          </View>
        </View>

        {/* 탭 선택 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            컴포넌트 비교
          </TextBox>
          <View style={styles.tabContainer}>
            <CustomButton
              title="ScrollView"
              onPress={() => setSelectedTab('scroll')}
              variant={selectedTab === 'scroll' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="FlatList"
              onPress={() => setSelectedTab('flat')}
              variant={selectedTab === 'flat' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="SectionList"
              onPress={() => setSelectedTab('section')}
              variant={selectedTab === 'section' ? 'primary' : 'outline'}
              size="small"
            />
          </View>
        </View>

        {/* ScrollView 예제 */}
        {selectedTab === 'scroll' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ScrollView 예제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ⚠️ 모든 아이템을 한 번에 렌더링 (10개 이하 권장)
            </TextBox>
            <View style={styles.listContainer}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
                {smallData.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.listItem,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {item.title}
                    </TextBox>
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.usageBox}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.usageTitle}
              >
                사용 시기:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 아이템이 10~20개 이하
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 설정 화면, 회원가입 화면
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 단순 스크롤 가능한 레이아웃
              </TextBox>
            </View>
          </View>
        )}

        {/* FlatList 예제 */}
        {selectedTab === 'flat' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              FlatList 예제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ✔ 가상화로 화면에 보이는 부분만 렌더링 (50개 이상 권장)
            </TextBox>
            <View style={styles.listContainer}>
              <FlatList
                data={largeData}
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
                onRefresh={handleRefresh}
                onEndReached={() => {
                  console.log('끝 도달 - 무한스크롤 가능');
                }}
                onEndReachedThreshold={0.5}
              />
            </View>
            <View style={styles.usageBox}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.usageTitle}
              >
                사용 시기:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 데이터가 많음 (50개 이상)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 피드, 쇼핑몰 상품 목록
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 무한스크롤이 필요한 경우
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • Pull-to-refresh가 필요한 경우
              </TextBox>
            </View>
          </View>
        )}

        {/* SectionList 예제 */}
        {selectedTab === 'section' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              SectionList 예제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              ✔ 섹션(그룹) 단위로 데이터 렌더링 (카테고리별 리스트)
            </TextBox>
            <View style={styles.listContainer}>
              <SectionList
                sections={sectionData}
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
                stickySectionHeadersEnabled={true}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </View>
            <View style={styles.usageBox}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.usageTitle}
              >
                사용 시기:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 그룹/섹션이 있는 리스트
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 날짜별 채팅, 알파벳별 연락처
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 카테고리별 상품 목록
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.usageItem}
              >
                • 섹션 헤더 고정이 필요한 경우
              </TextBox>
            </View>
          </View>
        )}

        {/* 실무 추천 기준 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎯 실무 추천 기준
          </TextBox>
          <View style={styles.recommendationContainer}>
            <View
              style={[
                styles.recommendationBox,
                {
                  backgroundColor: theme.primary + '20',
                  borderColor: theme.primary,
                },
              ]}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.recommendationTitle}
              >
                1. 데이터가 30개 이하
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.primary}
                style={styles.recommendationAnswer}
              >
                → ScrollView
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.recommendationDesc}
              >
                설정 페이지, 약관 동의 등
              </TextBox>
            </View>

            <View
              style={[
                styles.recommendationBox,
                {
                  backgroundColor: theme.secondary + '20',
                  borderColor: theme.secondary,
                },
              ]}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.recommendationTitle}
              >
                2. 피드, 쇼핑몰, 무한스크롤
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.secondary}
                style={styles.recommendationAnswer}
              >
                → FlatList
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.recommendationDesc}
              >
                인스타 피드, 상품 목록 등
              </TextBox>
            </View>

            <View
              style={[
                styles.recommendationBox,
                {
                  backgroundColor: theme.primary + '20',
                  borderColor: theme.primary,
                },
              ]}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.recommendationTitle}
              >
                3. 그룹핑된 리스트
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.primary}
                style={styles.recommendationAnswer}
              >
                → SectionList
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.recommendationDesc}
              >
                날짜별 채팅, 카테고리별 데이터
              </TextBox>
            </View>
          </View>
        </View>

        {/* 핵심 차이점 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔑 핵심 차이점
          </TextBox>
          <View style={styles.differenceContainer}>
            <View style={styles.differenceItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.differenceTitle}
              >
                ScrollView
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 모든 아이템 한 번에 렌더링
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 가상화 없음 → 성능 낮음
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 작은 데이터에 적합
              </TextBox>
            </View>

            <View style={styles.differenceItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.differenceTitle}
              >
                FlatList
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 화면에 보이는 부분만 렌더링
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 가상화로 성능 최적화
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 대량 데이터에 적합
              </TextBox>
            </View>

            <View style={styles.differenceItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.differenceTitle}
              >
                SectionList
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • FlatList + 섹션 기능
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 섹션 헤더/푸터 지원
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.differenceText}
              >
                • 그룹형 데이터에 적합
              </TextBox>
            </View>
          </View>
        </View>

        {/* 주의사항 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
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
              • ScrollView는 많은 데이터에서 메모리 폭발 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • FlatList/SectionList는 PureComponent → extraData 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • FlatList/SectionList는 getItemLayout으로 성능 최적화 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • SectionList의 sticky 헤더는 성능 이슈 가능
            </TextBox>
          </View>
        </View>
      </View>
    </ScrollView>
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
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  comparisonTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 50,
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  listContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  flatList: {
    flex: 1,
  },
  sectionList: {
    flex: 1,
  },
  listItem: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '600',
  },
  usageBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
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
  recommendationContainer: {
    gap: 12,
  },
  recommendationBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  recommendationTitle: {
    fontWeight: '600',
  },
  recommendationAnswer: {
    fontWeight: '600',
    fontSize: 18,
  },
  recommendationDesc: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  differenceContainer: {
    gap: 16,
  },
  differenceItem: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  differenceTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  differenceText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
