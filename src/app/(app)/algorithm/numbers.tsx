import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import {
  AccordionItem,
  CodeExampleItem,
  useCodeExecution,
  FunctionAccordion,
  TopicAccordion,
  SectionTitle,
} from '@/components/algorithm';

const topics: AccordionItem[] = [
  {
    id: '1',
    title: '자바스크립트 숫자란',
    content: {
      concept:
        'JavaScript의 모든 숫자는 64비트 부동소수점(IEEE 754)으로 표현된다',
      description:
        'JavaScript는 정수와 실수를 구분하지 않으며, 모든 숫자를 부동소수점으로 처리합니다. 이는 정밀도 문제를 야기할 수 있습니다.',
      list: [
        '모든 숫자는 64비트 부동소수점 (IEEE 754 표준)',
        '정수와 실수를 구분하지 않음',
        'Number.MAX_SAFE_INTEGER (2^53 - 1) 이상에서는 정밀도 손실 발생',
        'NaN (Not a Number): 숫자가 아닌 값',
        'Infinity와 -Infinity: 무한대 값',
        '0으로 나누면 Infinity 반환',
      ],
      examples: [
        {
          code: `// 숫자 타입 확인
console.log(typeof 42); // "number"
console.log(typeof 3.14); // "number"

// 정수와 실수 구분 없음
console.log(1 === 1.0); // true

// 정밀도 문제
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// 안전한 정수 범위
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991

// 특수 값
console.log(Number.NaN); // NaN
console.log(Number.POSITIVE_INFINITY); // Infinity
console.log(Number.NEGATIVE_INFINITY); // -Infinity`,
        },
      ],
    },
  },
  {
    id: '2',
    title: '숫자 함수',
    content: {
      isSection: true,
    },
  },
  {
    id: '3',
    title: '자주 사용하는 숫자 알고리즘',
    content: {
      isSection: true,
    },
  },
];

const numberFunctions: CodeExampleItem[] = [
  {
    id: 'isInteger',
    name: 'Number.isInteger()',
    category: '숫자 검증',
    definition: '값이 정수인지 확인한다',
    description: '주어진 값이 정수인지 불린 값으로 반환합니다.',
    code: `console.log(Number.isInteger(3)); // true
console.log(Number.isInteger(3.0)); // true
console.log(Number.isInteger(3.5)); // false
console.log(Number.isInteger('3')); // false
console.log(Number.isInteger(NaN)); // false
console.log(Number.isInteger(Infinity)); // false`,
  },
  {
    id: 'isNaN',
    name: 'Number.isNaN()',
    category: '숫자 검증',
    definition: '값이 NaN인지 확인한다',
    description:
      '전역 isNaN()과 달리 타입 변환 없이 엄격하게 NaN인지 확인합니다.',
    code: `console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN('NaN')); // false (문자열)
console.log(Number.isNaN(undefined)); // false
console.log(Number.isNaN({})); // false

// 전역 isNaN()과 비교
console.log(isNaN('NaN')); // true (타입 변환 후)
console.log(Number.isNaN('NaN')); // false (타입 변환 없음)`,
  },
  {
    id: 'isFinite',
    name: 'Number.isFinite()',
    category: '숫자 검증',
    definition: '값이 유한한 숫자인지 확인한다',
    description:
      '값이 유한한 숫자인지 확인합니다. Infinity와 NaN은 false를 반환합니다.',
    code: `console.log(Number.isFinite(42)); // true
console.log(Number.isFinite(3.14)); // true
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(-Infinity)); // false
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite('42')); // false (문자열)`,
  },
  {
    id: 'parseInt',
    name: 'parseInt()',
    category: '숫자 변환',
    definition: '문자열을 정수로 변환한다',
    description: '문자열의 시작 부분에서 정수를 추출하여 반환합니다.',
    code: `console.log(parseInt('123')); // 123
console.log(parseInt('123.45')); // 123 (소수점 이하 무시)
console.log(parseInt('123abc')); // 123 (숫자 부분만)
console.log(parseInt('abc123')); // NaN (숫자로 시작하지 않음)

// 진법 지정
console.log(parseInt('1010', 2)); // 10 (2진수)
console.log(parseInt('FF', 16)); // 255 (16진수)
console.log(parseInt('10', 8)); // 8 (8진수)`,
  },
  {
    id: 'parseFloat',
    name: 'parseFloat()',
    category: '숫자 변환',
    definition: '문자열을 부동소수점 숫자로 변환한다',
    description:
      '문자열의 시작 부분에서 부동소수점 숫자를 추출하여 반환합니다.',
    code: `console.log(parseFloat('123.45')); // 123.45
console.log(parseFloat('123')); // 123
console.log(parseFloat('123.45abc')); // 123.45
console.log(parseFloat('abc123')); // NaN

// 과학적 표기법
console.log(parseFloat('1.23e2')); // 123`,
  },
  {
    id: 'floor',
    name: 'Math.floor()',
    category: '반올림/내림',
    definition: '주어진 숫자보다 작거나 같은 가장 큰 정수를 반환한다',
    description: '소수점 이하를 버림하여 정수로 만듭니다.',
    code: `console.log(Math.floor(1.9)); // 1
console.log(Math.floor(1.1)); // 1
console.log(Math.floor(-1.1)); // -2 (음수는 더 작은 수로)
console.log(Math.floor(1)); // 1

// 실용 예시
const price = 19.99;
const roundedPrice = Math.floor(price);
console.log(roundedPrice); // 19`,
  },
  {
    id: 'ceil',
    name: 'Math.ceil()',
    category: '반올림/내림',
    definition: '주어진 숫자보다 크거나 같은 가장 작은 정수를 반환한다',
    description: '소수점 이하를 올림하여 정수로 만듭니다.',
    code: `console.log(Math.ceil(1.1)); // 2
console.log(Math.ceil(1.9)); // 2
console.log(Math.ceil(-1.1)); // -1 (음수는 더 큰 수로)
console.log(Math.ceil(1)); // 1

// 실용 예시
const items = 10;
const pages = Math.ceil(items / 3); // 한 페이지에 3개씩
console.log(pages); // 4`,
  },
  {
    id: 'round',
    name: 'Math.round()',
    category: '반올림/내림',
    definition: '주어진 숫자와 가장 가까운 정수를 반환한다',
    description: '소수점 이하를 반올림하여 정수로 만듭니다.',
    code: `console.log(Math.round(1.4)); // 1
console.log(Math.round(1.5)); // 2
console.log(Math.round(1.6)); // 2
console.log(Math.round(-1.4)); // -1
console.log(Math.round(-1.5)); // -1
console.log(Math.round(-1.6)); // -2`,
  },
  {
    id: 'abs',
    name: 'Math.abs()',
    category: '수학 함수',
    definition: '주어진 숫자의 절댓값을 반환한다',
    description: '음수를 양수로, 양수는 그대로 반환합니다.',
    code: `console.log(Math.abs(-12)); // 12
console.log(Math.abs(12)); // 12
console.log(Math.abs(-3.14)); // 3.14
console.log(Math.abs(0)); // 0

// 실용 예시: 두 점 사이의 거리
const distance = Math.abs(10 - 5);
console.log(distance); // 5`,
  },
  {
    id: 'max',
    name: 'Math.max()',
    category: '수학 함수',
    definition: '주어진 숫자들 중 가장 큰 값을 반환한다',
    description: '여러 숫자 중 최댓값을 찾습니다.',
    code: `console.log(Math.max(1, 2, 3)); // 3
console.log(Math.max(-1, -2, -3)); // -1
console.log(Math.max()); // -Infinity

// 배열에서 최댓값 찾기
const numbers = [1, 5, 3, 9, 2];
const max = Math.max(...numbers);
console.log(max); // 9`,
  },
  {
    id: 'min',
    name: 'Math.min()',
    category: '수학 함수',
    definition: '주어진 숫자들 중 가장 작은 값을 반환한다',
    description: '여러 숫자 중 최솟값을 찾습니다.',
    code: `console.log(Math.min(1, 2, 3)); // 1
console.log(Math.min(-1, -2, -3)); // -3
console.log(Math.min()); // Infinity

// 배열에서 최솟값 찾기
const numbers = [1, 5, 3, 9, 2];
const min = Math.min(...numbers);
console.log(min); // 1`,
  },
  {
    id: 'pow',
    name: 'Math.pow()',
    category: '수학 함수',
    definition: '밑수를 지수만큼 거듭제곱한 값을 반환한다',
    description: 'x의 y제곱을 계산합니다. ** 연산자와 동일합니다.',
    code: `console.log(Math.pow(2, 3)); // 8 (2^3)
console.log(Math.pow(5, 2)); // 25 (5^2)
console.log(Math.pow(10, -1)); // 0.1

// ** 연산자와 동일
console.log(2 ** 3); // 8
console.log(5 ** 2); // 25`,
  },
  {
    id: 'sqrt',
    name: 'Math.sqrt()',
    category: '수학 함수',
    definition: '주어진 숫자의 제곱근을 반환한다',
    description: '양수의 제곱근을 계산합니다.',
    code: `console.log(Math.sqrt(16)); // 4
console.log(Math.sqrt(25)); // 5
console.log(Math.sqrt(2)); // 1.4142135623730951
console.log(Math.sqrt(-1)); // NaN

// 거듭제곱으로 제곱근 구하기
console.log(Math.pow(16, 0.5)); // 4 (Math.sqrt(16)과 동일)`,
  },
  {
    id: 'random',
    name: 'Math.random()',
    category: '수학 함수',
    definition: '0 이상 1 미만의 난수를 반환한다',
    description: '0과 1 사이의 부동소수점 난수를 생성합니다.',
    code: `// 0 이상 1 미만의 난수
console.log(Math.random()); // 0.123456789 (예시)

// 0 이상 n 미만의 정수
const randomInt = (n) => Math.floor(Math.random() * n);
console.log(randomInt(10)); // 0~9 사이의 정수

// min 이상 max 미만의 정수
const randomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
console.log(randomRange(5, 10)); // 5~9 사이의 정수

// min 이상 max 이하의 정수 (max 포함)
const randomRangeInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
console.log(randomRangeInclusive(1, 6)); // 1~6 사이의 정수 (주사위)`,
  },
  {
    id: 'constants',
    name: 'Number 상수',
    category: '숫자 상수',
    definition: 'JavaScript에서 제공하는 숫자 관련 상수들',
    description: 'Number 객체와 Math 객체의 유용한 상수들입니다.',
    code: `// Number 상수
console.log(Number.EPSILON); // 2.220446049250313e-16 (표현 가능한 최소 간격)
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991 (안전한 최대 정수)
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991 (안전한 최소 정수)
console.log(Number.MAX_VALUE); // 1.7976931348623157e+308 (표현 가능한 최대 값)
console.log(Number.MIN_VALUE); // 5e-324 (표현 가능한 최소 양수)

// Math 상수
console.log(Math.PI); // 3.141592653589793
console.log(Math.E); // 2.718281828459045 (자연상수)
console.log(Math.LN2); // 0.6931471805599453 (log e 2)
console.log(Math.LN10); // 2.302585092994046 (log e 10)
console.log(Math.LOG2E); // 1.4426950408889634 (log 2 e)
console.log(Math.LOG10E); // 0.4342944819032518 (log 10 e)
console.log(Math.SQRT2); // 1.4142135623730951 (√2)
console.log(Math.SQRT1_2); // 0.7071067811865476 (√(1/2))`,
  },
];

const numberAlgorithms: CodeExampleItem[] = [
  {
    id: 'prime-test',
    name: '소수 테스트',
    category: '자주 사용하는 숫자 알고리즘',
    definition: '주어진 숫자가 소수인지 확인하는 알고리즘',
    description:
      '소수는 1과 자기 자신으로만 나누어떨어지는 1보다 큰 자연수입니다. 여러 방법으로 소수를 판별할 수 있습니다.',
    code: `// 기본 소수 판별 함수 (O(n))
const isPrimeBasic = (n) => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i < n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

// 최적화된 소수 판별 함수 (O(√n))
const isPrime = (n) => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  // √n까지만 확인하면 됨
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

// 테스트
console.log(isPrime(2)); // true
console.log(isPrime(3)); // true
console.log(isPrime(4)); // false
console.log(isPrime(17)); // true
console.log(isPrime(100)); // false
console.log(isPrime(97)); // true

// 특정 범위의 소수 찾기
const findPrimes = (max) => {
  const primes = [];
  for (let i = 2; i <= max; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
};

console.log(findPrimes(20)); // [2, 3, 5, 7, 11, 13, 17, 19]`,
  },
  {
    id: 'prime-factorization',
    name: '소인수분해',
    category: '자주 사용하는 숫자 알고리즘',
    definition: '주어진 숫자를 소수의 곱으로 분해하는 알고리즘',
    description:
      '소인수분해는 합성수를 소수들의 곱으로 표현하는 것입니다. 수학적 문제 해결에 자주 사용됩니다.',
    code: `// 소인수분해 함수
const primeFactorization = (n) => {
  const factors = [];
  let divisor = 2;
  
  while (n >= 2) {
    if (n % divisor === 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  
  return factors;
};

// 테스트
console.log(primeFactorization(12)); // [2, 2, 3]
console.log(primeFactorization(60)); // [2, 2, 3, 5]
console.log(primeFactorization(17)); // [17] (소수)
console.log(primeFactorization(100)); // [2, 2, 5, 5]

// 소인수분해 결과를 객체 형태로 반환
const primeFactorizationObject = (n) => {
  const factors = {};
  let divisor = 2;
  
  while (n >= 2) {
    if (n % divisor === 0) {
      factors[divisor] = (factors[divisor] || 0) + 1;
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  
  return factors;
};

console.log(primeFactorizationObject(12)); // { 2: 2, 3: 1 }
console.log(primeFactorizationObject(60)); // { 2: 2, 3: 1, 5: 1 }
console.log(primeFactorizationObject(100)); // { 2: 2, 5: 2 }

// 최적화된 버전 (√n까지만 확인)
const primeFactorizationOptimized = (n) => {
  const factors = [];
  let divisor = 2;
  
  while (divisor * divisor <= n) {
    if (n % divisor === 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  
  if (n > 1) {
    factors.push(n);
  }
  
  return factors;
};

console.log(primeFactorizationOptimized(12)); // [2, 2, 3]`,
  },
  {
    id: 'random-generator',
    name: '무작위수 생성기',
    category: '자주 사용하는 숫자 알고리즘',
    definition: '특정 범위의 무작위 수를 생성하는 알고리즘',
    description:
      'Math.random()을 사용하여 다양한 범위의 무작위 수를 생성하는 방법들입니다.',
    code: `// 0 이상 n 미만의 정수
const randomInt = (n) => {
  return Math.floor(Math.random() * n);
};

console.log(randomInt(10)); // 0~9 사이의 정수

// min 이상 max 미만의 정수
const randomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

console.log(randomRange(5, 10)); // 5~9 사이의 정수

// min 이상 max 이하의 정수 (max 포함)
const randomRangeInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

console.log(randomRangeInclusive(1, 6)); // 1~6 사이의 정수 (주사위)

// 부동소수점 난수 (min 이상 max 미만)
const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

console.log(randomFloat(1.5, 2.5)); // 1.5~2.5 사이의 부동소수점

// 배열에서 무작위 요소 선택
const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const fruits = ['apple', 'banana', 'orange', 'grape'];
console.log(randomElement(fruits)); // 배열의 무작위 요소

// 배열 섞기 (Fisher-Yates 알고리즘)
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const numbers = [1, 2, 3, 4, 5];
console.log(shuffle(numbers)); // 무작위로 섞인 배열

// 시드 기반 난수 생성기 (의사 난수)
const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const random = seededRandom(12345);
console.log(random()); // 시드에 따라 결정된 난수`,
  },
];

export default function NumbersScreen() {
  const { theme } = useTheme();
  const { executionResults, executeCode } = useCodeExecution();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        {topics.map((topic) => (
          <View key={topic.id}>
            {topic.content.isSection ? (
              <SectionTitle title={topic.title} />
            ) : (
              <TopicAccordion
                topic={topic}
                executionResults={executionResults}
                onExecute={executeCode}
              />
            )}

            {/* 숫자 함수 섹션 */}
            {topic.content.isSection && topic.id === '2' && (
              <>
                {numberFunctions.map((func) => (
                  <FunctionAccordion
                    key={func.id}
                    item={func}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {/* 자주 사용하는 숫자 알고리즘 섹션 */}
            {topic.content.isSection && topic.id === '3' && (
              <>
                {numberAlgorithms.map((algorithm) => (
                  <FunctionAccordion
                    key={algorithm.id}
                    item={algorithm}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}
          </View>
        ))}
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
});
