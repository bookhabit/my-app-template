import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import AlgorithmPrinciplesModal from '@/components/algorithm/modals/AlgorithmPrinciplesModal';
import AlgorithmProblemSolvingModal from '@/components/algorithm/modals/AlgorithmProblemSolvingModal';
import TextBox from '@/components/common/TextBox';

const complexityExamples = [
  {
    label: 'O(1)',
    title: '상수 시간 – 첫 번째 원소 조회',
    code: `function firstElement(arr) {
  return arr[0];
}
// 어떤 크기의 배열이든 한 번만 접근 → O(1)`,
    explanation: '입력 크기와 관계없이 일정한 시간만 소요됩니다.',
  },
  {
    label: 'O(n)',
    title: '선형 시간 – 배열 합 구하기',
    code: `function sum(arr) {
  let total = 0;
  for (const n of arr) {
    total += n;
  }
  return total;
}
// 모든 요소를 한 번씩 순회 → O(n)`,
    explanation: '입력이 늘어나면 반복 횟수도 비례해 증가합니다.',
  },
  {
    label: 'O(log n)',
    title: '로그 시간 – 정렬된 배열에서 이진 탐색',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
// 탐색 범위를 절반씩 줄임 → O(log n)`,
    explanation: '문제 크기를 매 단계 절반으로 줄이면 로그 복잡도가 됩니다.',
  },
  {
    label: 'O(n log n)',
    title: '선형 로그 시간 – 병합 정렬',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}
// 분할 단계 log n, 병합 단계 n → O(n log n)`,
    explanation:
      '문제를 재귀적으로 쪼개고 다시 합치는 정렬 알고리즘에서 자주 등장합니다.',
  },
  {
    label: 'O(n²)',
    title: '2차 시간 – 버블 정렬',
    code: `function bubbleSort(arr) {
  const nums = [...arr];
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length - i - 1; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
      }
    }
  }
  return nums;
}
// 중첩 반복문으로 모든 쌍 비교 → O(n²)`,
    explanation:
      '이중 루프처럼 입력에 비례해 두 번 반복할 때 제곱 복잡도가 됩니다.',
  },
];

export default function TimeSpaceScreen() {
  const { theme } = useTheme();
  const [principlesVisible, setPrinciplesVisible] = useState(false);
  const [problemModalVisible, setProblemModalVisible] = useState(false);

  useEffect(() => {
    // 스크린 진입 시 첫 번째 모달 표시
    setPrinciplesVisible(true);
  }, []);

  const handleFirstModalConfirm = () => {
    setPrinciplesVisible(false);
    setTimeout(() => {
      setProblemModalVisible(true);
    }, 250);
  };

  const handleSecondModalConfirm = () => {
    setProblemModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View style={styles.content}>
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title3" color={theme.text}>
              시간 복잡도
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={styles.body}
            >
              알고리즘이 입력 크기 n에 따라 얼마나 많은 연산을 수행하는지를 실행
              시간 관점에서 분석합니다.
            </TextBox>
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title3" color={theme.text}>
              공간 복잡도
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={styles.body}
            >
              알고리즘이 입력 크기 n에 따라 얼마나 많은 메모리를 사용하는지를
              측정합니다.
            </TextBox>
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title3" color={theme.text}>
              Big-O 표기법
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={styles.body}
            >
              알고리즘의 입력이 충분히 커질 때 최악의 경우 성능을 간단하게
              표현한 표기 방법입니다.
            </TextBox>
            {[
              {
                label: 'O(1)',
                desc: '상수 시간 · 입력 크기와 무관하게 일정한 성능.',
              },
              {
                label: 'O(n)',
                desc: '선형 시간 · 입력 크기에 비례하여 늘어나는 연산.',
              },
              {
                label: 'O(log n)',
                desc: '로그 시간 · 매 반복마다 문제 크기를 절반으로 줄임.',
              },
              {
                label: 'O(n log n)',
                desc: '로그 팩터가 곱해진 선형 시간 · 대부분의 효율적 정렬 알고리즘.',
              },
              {
                label: 'O(n²)',
                desc: '2차 시간 · 중첩 반복문이 있을 때 흔히 등장.',
              },
            ].map((item) => (
              <TextBox
                key={item.label}
                variant="body3"
                color={theme.text}
                style={styles.listItem}
              >
                {`${item.label} — ${item.desc}`}
              </TextBox>
            ))}
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title3" color={theme.text}>
              복잡도 계산 법칙
            </TextBox>
            {[
              '계수 법칙: O(k·f(n)) = O(f(n)) (상수배는 복잡도에 영향을 주지 않는다)',
              '합의 법칙: O(f(n) + g(n)) = O(max(f(n), g(n)))',
              '곱의 법칙: O(f(n) · g(n)) — 단계적 절차가 독립적으로 연속될 때',
              '전이 법칙: f(n) ∈ O(g(n)), g(n) ∈ O(h(n)) → f(n) ∈ O(h(n))',
              '다항 법칙: O(nᵏ) — k가 고정된 다항식은 효율적이라고 간주',
            ].map((line) => (
              <TextBox
                key={line}
                variant="body3"
                color={theme.textSecondary}
                style={styles.listItem}
              >
                {line}
              </TextBox>
            ))}
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title3" color={theme.text}>
              복잡도별 예시 코드
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={styles.body}
            >
              각 복잡도에 해당하는 간단한 함수와 주석을 참고해 차이를 체감해
              보세요.
            </TextBox>
            {complexityExamples.map((sample) => (
              <View key={sample.label} style={styles.exampleCard}>
                <TextBox variant="title4" color={theme.text}>
                  {sample.label} · {sample.title}
                </TextBox>
                <View
                  style={[
                    styles.codeBlock,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TextBox
                    variant="caption1"
                    color={theme.text}
                    style={styles.codeText}
                  >
                    {sample.code}
                  </TextBox>
                </View>
                <TextBox
                  variant="body3"
                  color={theme.textSecondary}
                  style={styles.body}
                >
                  {sample.explanation}
                </TextBox>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <AlgorithmPrinciplesModal
        visible={principlesVisible}
        onConfirm={handleFirstModalConfirm}
      />
      <AlgorithmProblemSolvingModal
        visible={problemModalVisible}
        onConfirm={handleSecondModalConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  body: {
    lineHeight: 20,
  },
  listItem: {
    lineHeight: 20,
    marginBottom: 4,
  },
  codeBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  exampleCard: {
    gap: 12,
  },
});
