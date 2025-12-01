import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ServerScreen() {
  const { theme } = useTheme();

  const [testResult, setTestResult] = useState<string>('');

  const testServerAPI = async () => {
    try {
      // 클라이언트에서는 직접 서버 API를 호출할 수 없으므로
      // API 라우트를 통해 테스트
      const response = await fetch('/api/test');
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResult(`오류: ${error.message || error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Server" showBackButton />
      <View style={styles.content}>
        <View style={styles.section}>
          <TextBox
            variant="title2"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Expo Server
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            expo-server는 Expo Router의 서버 사이드 API 및 런타임입니다. API
            라우트에서 사용할 수 있는 헬퍼 함수들을 제공합니다.
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
              • origin(): 현재 요청의 origin URL 반환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • environment(): 요청의 환경 이름 반환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • runTask(): 즉시 실행되는 태스크
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • deferTask(): 응답 후 실행되는 태스크
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • setResponseHeaders(): 응답 헤더 설정
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • StatusError: 에러 응답 표현
            </TextBox>
          </View>
        </View>

        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            서버 사이드 API
          </TextBox>
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: theme.warning + '20',
                borderColor: theme.warning,
              },
            ]}
          >
            <TextBox variant="body4" color={theme.text}>
              ⚠️ expo-server는 서버 사이드에서만 사용할 수 있습니다. 클라이언트
              앱에서는 직접 테스트할 수 없으며, API 라우트를 통해 사용해야
              합니다.
            </TextBox>
          </View>
        </View>

        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            API 라우트 예제
          </TextBox>
          <View
            style={[
              styles.codeBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.codeText}
            >
              {`// app/api/test/route.ts
import { origin, environment, runTask, deferTask } from 'expo-server';

export async function GET() {
  // 즉시 실행되는 태스크
  runTask(async () => {
    console.log('즉시 실행');
  });

  // 응답 후 실행되는 태스크
  deferTask(async () => {
    console.log('응답 후 실행');
  });

  return Response.json({
    origin: origin(),
    environment: environment(),
    isProduction: environment() === null,
  });
}

// app/api/error/route.ts
import { StatusError } from 'expo-server';

export async function GET(request, { postId }) {
  if (!postId) {
    throw new StatusError(400, 'postId is required');
  }
  return Response.json({ postId });
}

// app/+middleware.ts
import type { MiddlewareFunction } from 'expo-server';

const middleware: MiddlewareFunction = async (request) => {
  console.log('Middleware:', request.url);
  // Response를 반환하면 요청이 중단됨
  // void를 반환하면 다음 미들웨어로 진행
};

export default middleware;

export const unstable_settings = {
  matcher: {
    methods: ['GET', 'POST'],
    patterns: ['/api/*'],
  },
};`}
            </TextBox>
          </View>
        </View>

        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            어댑터
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
              • expo-server/adapter/bun - Bun
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • expo-server/adapter/express - Express
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • expo-server/adapter/http - Node.js
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • expo-server/adapter/netlify - Netlify Functions
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • expo-server/adapter/vercel - Vercel Functions
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • expo-server/adapter/workerd - Cloudflare Workers
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
  description: {
    lineHeight: 20,
    marginBottom: 12,
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
  warningBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    lineHeight: 20,
    fontSize: 12,
  },
});
