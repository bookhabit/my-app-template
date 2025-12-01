import { useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const { width } = Dimensions.get('window');
const pageWidth = width - 40;

const pages = [
  { id: 0, title: '첫 번째 페이지', color: '#FF6B6B' },
  { id: 1, title: '두 번째 페이지', color: '#4ECDC4' },
  { id: 2, title: '세 번째 페이지', color: '#45B7D1' },
  { id: 3, title: '네 번째 페이지', color: '#FFA07A' },
  { id: 4, title: '다섯 번째 페이지', color: '#98D8C8' },
];

export default function PagerViewScreen() {
  const { theme } = useTheme();

  // State
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const goToPage = (page: number) => {
    pagerRef.current?.setPage(page);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="PagerView" showBackButton />
      <View style={styles.content}>
        {/* 페이지 뷰 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            페이지 뷰
          </TextBox>
          <View
            style={[
              styles.pagerContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <PagerView
              ref={pagerRef}
              style={styles.pager}
              initialPage={0}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              {pages.map((page) => (
                <View
                  key={page.id}
                  style={[styles.page, { backgroundColor: page.color }]}
                >
                  <TextBox
                    variant="title1"
                    color="white"
                    style={styles.pageTitle}
                  >
                    {page.title}
                  </TextBox>
                  <TextBox
                    variant="body2"
                    color="white"
                    style={styles.pageNumber}
                  >
                    페이지 {page.id + 1} / {pages.length}
                  </TextBox>
                </View>
              ))}
            </PagerView>
          </View>
          <View
            style={[
              styles.resultBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              현재 페이지: {currentPage + 1} / {pages.length}
            </TextBox>
          </View>
        </View>

        {/* 페이지 네비게이션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            페이지 네비게이션
          </TextBox>
          <View style={styles.buttonRow}>
            {pages.map((page) => (
              <CustomButton
                key={page.id}
                title={`${page.id + 1}`}
                onPress={() => goToPage(page.id)}
                style={[styles.button, styles.flex1]}
                variant={currentPage === page.id ? 'primary' : 'ghost'}
              />
            ))}
          </View>
        </View>

        {/* 참고사항 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            참고사항
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • PagerView는 좌우 스와이프로 페이지를 전환할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • setPage() 메서드로 프로그래밍 방식으로 페이지를 이동할 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • onPageSelected 이벤트로 페이지 변경을 감지할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • initialPage로 초기 페이지를 설정할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS와 Android 모두에서 동작합니다.
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
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  pagerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    height: 300,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pageTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  pageNumber: {
    textAlign: 'center',
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex1: {
    flex: 1,
    minWidth: '15%',
  },
  button: {
    marginTop: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    lineHeight: 20,
  },
});
