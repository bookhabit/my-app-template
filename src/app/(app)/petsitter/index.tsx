import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

type ListItem = string | { title: string; details: string[] };

interface SectionProps {
  title: string;
  description?: string;
  items?: ListItem[];
}

const sections: SectionProps[] = [
  {
    title: '프로젝트 개요',
    items: [
      '펫시터: 반려견 주인과 돌봄 도우미를 연결하는 애플리케이션',
      '개발 플로우: 요구사항/도메인 정의 → OpenAPI 명세 → FE/BE 구현 → 통합',
    ],
  },
  {
    title: '핵심 기능',
    items: ['회원가입', '구인 공고 등록', '구인 공고 지원'],
  },
  {
    title: '도메인 모델',
    items: [
      { title: 'User', details: ['id', 'emailAddress', 'password', 'fullName', 'roles'] },
      {
        title: 'Job',
        details: ['id', 'startTime', 'endTime', 'activity', 'dog (Dog 모델 참조)'],
      },
      { title: 'Dog', details: ['id', 'name', 'age', 'breed', 'size'] },
      { title: 'JobApplication', details: ['id', 'status', 'user_id', 'job_id'] },
    ],
  },
  {
    title: '사용자 시나리오 요약',
    items: [
      {
        title: '공통',
        details: [
          '회원가입/로그인',
          '계정 상세 조회 및 수정/삭제',
        ],
      },
      {
        title: '반려동물 주인',
        details: [
          '구인공고 등록/조회/수정/삭제',
          '지원자 목록 확인 및 승인',
        ],
      },
      {
        title: '돌봄 도우미',
        details: ['구인공고 목록 조회', '관심 공고 지원'],
      },
      {
        title: '관리자',
        details: ['로그인 후 어드민 기능', '사용자/구인공고 수정 및 삭제'],
      },
    ],
  },
  {
    title: 'API 엔드포인트 (요약)',
    items: [
      {
        title: '사용자',
        details: ['POST /users', 'POST /auth/login', 'GET/PATCH/DELETE /users/{id}'],
      },
      {
        title: '구인공고',
        details: [
          'POST /jobs',
          'GET /jobs, GET /jobs/{id}',
          'PATCH/DELETE /jobs/{id}',
          'GET /users/{id}/jobs',
        ],
      },
      {
        title: '지원',
        details: [
          'POST /jobs/{id}/job-applications',
          'GET /jobs/{id}/job-applications',
          'PATCH /job-applications/{id}',
        ],
      },
    ],
  },
];

const Section: React.FC<SectionProps> = ({ title, description, items }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <TextBox variant="title4" color={theme.text}>
        {title}
      </TextBox>
      {description ? (
        <TextBox variant="body3" color={theme.textSecondary} style={styles.sectionDescription}>
          {description}
        </TextBox>
      ) : null}
      {items?.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <TextBox
              key={`${title}-item-${index}`}
              variant="body3"
              color={theme.text}
              style={styles.bullet}
            >
              • {item}
            </TextBox>
          );
        }

        return (
          <View key={`${title}-item-${index}`} style={styles.nestedItem}>
            <TextBox variant="body2" color={theme.text}>
              • {item.title}
            </TextBox>
            {item.details.map((detail, detailIndex) => (
              <TextBox
                key={`${title}-item-${index}-detail-${detailIndex}`}
                variant="body4"
                color={theme.textSecondary}
                style={styles.subBullet}
              >
                - {detail}
              </TextBox>
            ))}
          </View>
        );
      })}
    </View>
  );
};

export default function PetsitterScreen() {
  const { theme, isDarkMode } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <TextBox variant="title2" color={theme.primary} style={styles.pageTitle}>
        펫시터 요구사항 요약
      </TextBox>
      <TextBox variant="body3" color={theme.textSecondary} style={styles.subtitle}>
        한 화면에서 핵심 요구사항과 도메인, 시나리오, API를 빠르게 확인할 수 있습니다.
      </TextBox>

      {sections.map((section) => (
        <Section
          key={section.title}
          title={section.title}
          description={section.description}
          items={section.items}
        />
      ))}

      <View
        style={[
          styles.meta,
          {
            backgroundColor: isDarkMode ? '#1F2933' : '#F2F4F7',
            borderColor: theme.border,
          },
        ]}
      >
        <TextBox variant="body2" color={theme.text}>
          문서 버전: 1.0
        </TextBox>
        <TextBox variant="body3" color={theme.textSecondary}>
          최종 수정일: 2026-01-20
        </TextBox>
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
    gap: 16,
  },
  pageTitle: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  sectionDescription: {
    marginBottom: 4,
  },
  bullet: {
    marginLeft: 4,
  },
  nestedItem: {
    gap: 4,
  },
  subBullet: {
    marginLeft: 12,
  },
  meta: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    gap: 6,
  },
});
