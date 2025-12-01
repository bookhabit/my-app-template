import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

export default function ScrollViewScreen() {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollEventCount, setScrollEventCount] = useState(0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          ScrollView 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          ScrollView는 스크롤 가능한 컨테이너입니다. 여기서 테스트해보세요.
        </TextBox>

        {/* 기본 ScrollView 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 기본 ScrollView (세로 스크롤)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ⚠️ 부모 View에 flex:1 설정 필요
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    아이템 {index + 1}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* horizontal 스크롤 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. Horizontal ScrollView (가로 스크롤)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            horizontal={true}로 가로 스크롤 활성화
          </TextBox>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.horizontalItem,
                  { backgroundColor: theme.secondary + '40' },
                ]}
              >
                <TextBox variant="body2" color={theme.text}>
                  카드 {index + 1}
                </TextBox>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* onScroll 이벤트 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. 스크롤 이벤트 (onScroll)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onScroll, onScrollBeginDrag, onScrollEndDrag
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                setScrollY(offsetY);
                setScrollEventCount((prev) => prev + 1);
              }}
              scrollEventThrottle={16}
            >
              {Array.from({ length: 20 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    스크롤 아이템 {index + 1}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextBox
            variant="body4"
            color={theme.primary}
            style={styles.statusText}
          >
            스크롤 Y 위치: {scrollY.toFixed(0)}px
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.statusText}
          >
            이벤트 호출 횟수: {scrollEventCount}
          </TextBox>
        </View>

        {/* scrollTo 메서드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. scrollTo / scrollToEnd 메서드
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
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="500px로"
              onPress={() => {
                scrollViewRef.current?.scrollTo({ y: 500, animated: true });
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="맨 아래로"
              onPress={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
              variant="outline"
              size="small"
            />
          </View>
          <View style={styles.scrollContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {Array.from({ length: 15 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.secondary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    아이템 {index + 1}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* pagingEnabled 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. pagingEnabled (페이지 단위 스크롤)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크롤을 페이지 단위로 멈춤 (가로 스크롤에서 자주 사용)
          </TextBox>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pagingContent}
          >
            {['페이지 1', '페이지 2', '페이지 3', '페이지 4'].map(
              (page, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageItem,
                    {
                      backgroundColor:
                        index % 2 === 0
                          ? theme.primary + '40'
                          : theme.secondary + '40',
                    },
                  ]}
                >
                  <TextBox variant="title3" color={theme.text}>
                    {page}
                  </TextBox>
                </View>
              )
            )}
          </ScrollView>
        </View>

        {/* snapToInterval 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. snapToInterval (일정 간격 스냅)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            일정 간격마다 스크롤이 멈춤
          </TextBox>
          <ScrollView
            horizontal
            snapToInterval={200}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.snapContent}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.snapItem,
                  { backgroundColor: theme.primary + '30' },
                ]}
              >
                <TextBox variant="body2" color={theme.text}>
                  스냅 {index + 1}
                </TextBox>
              </View>
            ))}
          </ScrollView>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            snapToInterval: 200px (200px 간격마다 멈춤)
          </TextBox>
        </View>

        {/* refreshControl 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. RefreshControl (Pull-to-refresh)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            아래로 당겨서 새로고침 (세로 스크롤만 지원)
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    setTimeout(() => {
                      setRefreshing(false);
                    }, 2000);
                  }}
                  tintColor={theme.primary}
                  colors={[theme.primary]}
                />
              }
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    아이템 {index + 1}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            아래로 당겨서 새로고침하세요
          </TextBox>
        </View>

        {/* stickyHeaderIndices 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. stickyHeaderIndices (고정 헤더)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            특정 인덱스의 자식을 상단에 고정 (세로 스크롤만 지원)
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              stickyHeaderIndices={[0, 5, 10]}
            >
              {Array.from({ length: 15 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    index === 0 || index === 5 || index === 10
                      ? [
                          styles.stickyHeader,
                          { backgroundColor: theme.primary },
                        ]
                      : [
                          styles.scrollItem,
                          { backgroundColor: theme.primary + '20' },
                        ],
                  ]}
                >
                  <TextBox
                    variant="body2"
                    color={
                      index === 0 || index === 5 || index === 10
                        ? '#FFFFFF'
                        : theme.text
                    }
                  >
                    {index === 0 || index === 5 || index === 10
                      ? `고정 헤더 ${index === 0 ? '1' : index === 5 ? '2' : '3'}`
                      : `아이템 ${index + 1}`}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* keyboardDismissMode 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            9. keyboardDismissMode (iOS)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크롤 시 키보드 숨김 모드: 'none', 'on-drag', 'interactive'
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardDismissMode="on-drag"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.secondary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    아이템 {index + 1}
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            keyboardDismissMode: 'on-drag' (드래그 시 키보드 숨김)
          </TextBox>
        </View>

        {/* contentContainerStyle 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            10. contentContainerStyle
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            자식 컨테이너의 스타일 설정 (padding, gap 등)
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { padding: 30, gap: 20 },
              ]}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    패딩 30px, gap 20px
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* scrollEnabled 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            11. scrollEnabled (스크롤 활성화/비활성화)
          </TextBox>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              scrollEnabled={false}
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.scrollItem, { backgroundColor: theme.border }]}
                >
                  <TextBox variant="body2" color={theme.textSecondary}>
                    스크롤 비활성화 (아이템 {index + 1})
                  </TextBox>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            scrollEnabled: false (스크롤 불가능)
          </TextBox>
        </View>

        {/* 실무 팁 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 실무 팁
          </TextBox>
          <View style={styles.tipsContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 아이템이 많으면 FlatList 사용 권장 (성능)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 부모 View에 flex:1 설정 필수
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • Pull-to-refresh는 세로 스크롤만 지원
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • stickyHeader는 가로 스크롤과 호환되지 않음
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • scrollEventThrottle로 이벤트 빈도 조절 (기본값: 0)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • ScrollView 안에 ScrollView는 nestedScrollEnabled 필요 (Android)
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
  scrollContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  scrollItem: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  horizontalItem: {
    width: 150,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  pagingContent: {
    flexDirection: 'row',
  },
  pageItem: {
    width: 300,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  snapContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  snapItem: {
    width: 200,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  stickyHeader: {
    padding: 16,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
