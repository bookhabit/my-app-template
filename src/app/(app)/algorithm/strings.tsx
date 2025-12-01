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
    title: '자바스크립트 문자열이란',
    content: {
      concept: '문자열(String)은 문자들의 순서 있는 나열',
      description:
        'JavaScript에서 문자열은 원시 타입(primitive type)이지만, 객체처럼 메서드를 사용할 수 있습니다. 문자열은 불변(immutable)입니다.',
      list: [
        '문자열은 원시 타입이지만 객체처럼 동작 (래퍼 객체)',
        '문자열은 불변(immutable) - 한 번 생성되면 변경 불가',
        '문자열 연결 시 새로운 문자열이 생성됨',
        '템플릿 리터럴(백틱)을 사용하면 보간과 멀티라인 지원',
        '문자열은 유니코드 문자를 지원',
      ],
      examples: [
        {
          code: `// 문자열 생성 방법
const str1 = '작은따옴표';
const str2 = "큰따옴표";
const str3 = \`템플릿 리터럴\`;

// 템플릿 리터럴의 장점
const name = 'John';
const greeting = \`안녕하세요, \${name}님!\`;
console.log(greeting); // "안녕하세요, John님!"

// 멀티라인 문자열
const multiLine = \`첫 번째 줄
두 번째 줄
세 번째 줄\`;

// 문자열은 불변
const str = 'hello';
str[0] = 'H'; // 에러는 없지만 변경되지 않음
console.log(str); // "hello"`,
        },
      ],
    },
  },
  {
    id: '2',
    title: '문자열 함수',
    content: {
      isSection: true,
    },
  },
  {
    id: '3',
    title: '정규표현식',
    content: {
      isSection: true,
    },
  },
  {
    id: '4',
    title: '인코딩',
    content: {
      isSection: true,
    },
  },
  {
    id: '5',
    title: '암호화',
    content: {
      isSection: true,
    },
  },
];

const stringFunctions: CodeExampleItem[] = [
  {
    id: 'charAt',
    name: 'charAt()',
    category: '문자열 접근',
    definition: '문자열의 특정 인덱스에 있는 문자를 반환한다',
    description:
      '인덱스를 사용하여 문자열의 특정 위치에 있는 문자를 가져옵니다. 인덱스는 0부터 시작합니다.',
    code: `const str = 'Hello World';

// 인덱스로 문자 접근
const firstChar = str.charAt(0);
console.log(firstChar); // "H"

const fifthChar = str.charAt(4);
console.log(fifthChar); // "o"

// 마지막 문자 접근
const lastChar = str.charAt(str.length - 1);
console.log(lastChar); // "d"

// 범위를 벗어난 인덱스
const outOfRange = str.charAt(100);
console.log(outOfRange); // "" (빈 문자열)

// 대괄호 표기법과 비교
console.log(str[0]); // "H" (charAt과 동일)
console.log(str[100]); // undefined (charAt은 "" 반환)`,
  },
  {
    id: 'compare',
    name: '문자열 비교',
    category: '문자열 비교',
    definition: '문자열을 비교하는 다양한 방법',
    description:
      'JavaScript에서 문자열을 비교하는 방법은 여러 가지가 있습니다. ==, ===, localeCompare() 등을 사용할 수 있습니다.',
    code: `const str1 = 'apple';
const str2 = 'banana';
const str3 = 'Apple';

// == 연산자 (타입 변환 후 비교)
console.log('5' == 5); // true
console.log('5' === 5); // false

// === 연산자 (엄격한 비교)
console.log(str1 === 'apple'); // true
console.log(str1 === str3); // false (대소문자 구분)

// localeCompare() - 사전식 순서 비교
console.log(str1.localeCompare(str2)); // -1 (str1이 str2보다 앞)
console.log(str2.localeCompare(str1)); // 1 (str2가 str1보다 뒤)
console.log(str1.localeCompare(str1)); // 0 (같음)

// 대소문자 무시 비교
console.log(str1.toLowerCase() === str3.toLowerCase()); // true

// 부분 문자열 포함 여부
const text = 'Hello World';
console.log(text.includes('World')); // true
console.log(text.startsWith('Hello')); // true
console.log(text.endsWith('World')); // true`,
  },
  {
    id: 'indexOf',
    name: 'indexOf()',
    category: '문자열 검색',
    definition: '문자열에서 특정 값의 첫 번째 인덱스를 반환한다',
    description:
      '문자열 내에서 특정 부분 문자열이나 문자의 위치를 찾습니다. 없으면 -1을 반환합니다.',
    code: `const str = 'Hello World, Hello JavaScript';

// 첫 번째로 나타나는 위치
const index = str.indexOf('Hello');
console.log(index); // 0

// 두 번째로 나타나는 위치 찾기
const secondIndex = str.indexOf('Hello', 1);
console.log(secondIndex); // 13

// 문자 검색
const charIndex = str.indexOf('W');
console.log(charIndex); // 6

// 찾지 못한 경우
const notFound = str.indexOf('Python');
console.log(notFound); // -1

// lastIndexOf() - 마지막으로 나타나는 위치
const lastIndex = str.lastIndexOf('Hello');
console.log(lastIndex); // 13`,
  },
  {
    id: 'split',
    name: 'split()',
    category: '문자열 분해',
    definition: '문자열을 지정된 구분자를 기준으로 배열로 분할한다',
    description:
      '문자열을 여러 부분으로 나누어 배열로 반환합니다. 구분자를 지정하지 않으면 전체 문자열이 하나의 요소로 반환됩니다.',
    code: `const str = 'apple,banana,orange';

// 쉼표로 분할
const fruits = str.split(',');
console.log(fruits); // ["apple", "banana", "orange"]

// 공백으로 분할
const sentence = 'Hello World JavaScript';
const words = sentence.split(' ');
console.log(words); // ["Hello", "World", "JavaScript"]

// 빈 문자열로 분할 (각 문자로 분할)
const chars = 'hello'.split('');
console.log(chars); // ["h", "e", "l", "l", "o"]

// 구분자와 함께 limit 지정
const limited = str.split(',', 2);
console.log(limited); // ["apple", "banana"]

// 정규표현식 사용
const text = 'apple,banana;orange:grape';
const items = text.split(/[,;:]/);
console.log(items); // ["apple", "banana", "orange", "grape"]`,
  },
  {
    id: 'replace',
    name: 'replace()',
    category: '문자열 바꾸기',
    definition: '문자열에서 특정 패턴을 찾아 다른 문자열로 교체한다',
    description:
      '첫 번째로 일치하는 부분만 교체합니다. 모든 일치 항목을 교체하려면 replaceAll()을 사용하거나 정규표현식의 g 플래그를 사용합니다.',
    code: `const str = 'Hello World, Hello JavaScript';

// 첫 번째 일치만 교체
const replaced1 = str.replace('Hello', 'Hi');
console.log(replaced1); // "Hi World, Hello JavaScript"

// 모든 일치 교체 (replaceAll)
const replaced2 = str.replaceAll('Hello', 'Hi');
console.log(replaced2); // "Hi World, Hi JavaScript"

// 정규표현식으로 모든 일치 교체
const replaced3 = str.replace(/Hello/g, 'Hi');
console.log(replaced3); // "Hi World, Hi JavaScript"

// 함수를 사용한 교체
const text = 'apple 123 banana 456';
const replaced4 = text.replace(/\d+/g, (match) => {
  return parseInt(match) * 2;
});
console.log(replaced4); // "apple 246 banana 912"

// 대소문자 무시 교체
const caseInsensitive = 'Hello hello HELLO'.replace(/hello/gi, 'Hi');
console.log(caseInsensitive); // "Hi Hi Hi"`,
  },
];

const regexTopics: AccordionItem[] = [
  {
    id: 'regex-1',
    title: '정규표현식이란',
    content: {
      concept: '정규표현식(Regular Expression)은 문자열 패턴을 표현하는 방법',
      description:
        '정규표현식은 문자열에서 특정 패턴을 찾거나 검증하는 데 사용됩니다. 복잡한 문자열 조작을 간단하게 할 수 있습니다.',
      examples: [
        {
          code: `// 정규표현식 생성 방법
// 1. 리터럴 방식
const regex1 = /pattern/;

// 2. RegExp 생성자
const regex2 = new RegExp('pattern');

// 기본 사용 예시
const text = 'Hello 123 World';
const pattern = /\d+/; // 숫자 패턴

console.log(pattern.test(text)); // true
console.log(text.match(pattern)); // ["123"]`,
        },
      ],
    },
  },
];

const regexMethods: CodeExampleItem[] = [
  {
    id: 'regex-search',
    name: 'search()',
    category: 'RegExp 객체',
    definition:
      '문자열에서 정규표현식과 일치하는 첫 번째 위치의 인덱스를 반환한다',
    description:
      'String 메서드로, 정규표현식과 일치하는 부분을 찾아 인덱스를 반환합니다. 없으면 -1을 반환합니다.',
    code: `const str = 'Hello World 123';

// 숫자 패턴 검색
const index = str.search(/\d+/);
console.log(index); // 12

// 문자 패턴 검색
const wordIndex = str.search(/World/);
console.log(wordIndex); // 6

// 찾지 못한 경우
const notFound = str.search(/Python/);
console.log(notFound); // -1

// 대소문자 무시 검색
const caseIndex = str.search(/world/i);
console.log(caseIndex); // 6`,
  },
  {
    id: 'regex-match',
    name: 'match()',
    category: 'RegExp 객체',
    definition: '문자열에서 정규표현식과 일치하는 모든 결과를 배열로 반환한다',
    description:
      'String 메서드로, 정규표현식과 일치하는 부분을 찾아 배열로 반환합니다. g 플래그가 없으면 첫 번째 일치만 반환합니다.',
    code: `const str = 'Hello 123 World 456 JavaScript 789';

// 숫자 패턴 매칭 (g 플래그 없음)
const match1 = str.match(/\d+/);
console.log(match1); // ["123"] (첫 번째만)

// 숫자 패턴 매칭 (g 플래그 있음)
const match2 = str.match(/\d+/g);
console.log(match2); // ["123", "456", "789"] (모든 일치)

// 문자 패턴 매칭
const words = str.match(/[A-Z][a-z]+/g);
console.log(words); // ["Hello", "World", "JavaScript"]

// 찾지 못한 경우
const notFound = str.match(/Python/);
console.log(notFound); // null`,
  },
  {
    id: 'regex-exec',
    name: 'exec()',
    category: 'String',
    definition: '정규표현식과 일치하는 부분을 찾아 상세 정보를 반환한다',
    description:
      'RegExp 메서드로, 일치하는 부분과 캡처 그룹 정보를 포함한 배열을 반환합니다. g 플래그가 있으면 반복 호출 시 다음 일치를 찾습니다.',
    code: `const str = 'Hello 123 World 456';
const regex = /\d+/g;

// 첫 번째 일치
let result = regex.exec(str);
console.log(result); // ["123", index: 6, input: "Hello 123 World 456"]

// 두 번째 일치 (g 플래그로 인해 다음 일치 찾음)
result = regex.exec(str);
console.log(result); // ["456", index: 14, ...]

// 더 이상 일치 없음
result = regex.exec(str);
console.log(result); // null

// 캡처 그룹 사용
const dateStr = '2024-01-15';
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
const dateMatch = dateRegex.exec(dateStr);
console.log(dateMatch);
// ["2024-01-15", "2024", "01", "15", index: 0, ...]
console.log(dateMatch[1]); // "2024" (년도)
console.log(dateMatch[2]); // "01" (월)
console.log(dateMatch[3]); // "15" (일)`,
  },
  {
    id: 'regex-test',
    name: 'test()',
    category: 'String',
    definition: '정규표현식이 문자열과 일치하는지 불린 값으로 반환한다',
    description:
      'RegExp 메서드로, 정규표현식이 문자열에 일치하는지 true/false로 반환합니다. 간단한 검증에 유용합니다.',
    code: `const email = 'user@example.com';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 이메일 형식 검증
console.log(emailRegex.test(email)); // true

const invalidEmail = 'invalid-email';
console.log(emailRegex.test(invalidEmail)); // false

// 숫자만 포함하는지 검증
const numberRegex = /^\d+$/;
console.log(numberRegex.test('12345')); // true
console.log(numberRegex.test('123abc')); // false

// 전화번호 형식 검증
const phoneRegex = /^010-\d{4}-\d{4}$/;
console.log(phoneRegex.test('010-1234-5678')); // true
console.log(phoneRegex.test('010-123-4567')); // false`,
  },
];

const regexRules: CodeExampleItem[] = [
  {
    id: 'regex-caret',
    name: '^ (캐럿)',
    category: '정규표현식 규칙',
    definition: '문자열의 시작을 나타낸다',
    description: '^는 문자열의 시작 부분을 의미합니다.',
    code: `const str1 = 'Hello World';
const str2 = 'World Hello';

// ^로 시작하는지 확인
console.log(/^Hello/.test(str1)); // true
console.log(/^Hello/.test(str2)); // false

// ^와 $를 함께 사용하여 전체 문자열 매칭
console.log(/^Hello World$/.test(str1)); // true
console.log(/^Hello World$/.test('Hello World!')); // false`,
  },
  {
    id: 'regex-dollar',
    name: '$ (달러)',
    category: '정규표현식 규칙',
    definition: '문자열의 끝을 나타낸다',
    description: '$는 문자열의 끝 부분을 의미합니다.',
    code: `const str1 = 'Hello World';
const str2 = 'Hello World!';

// $로 끝나는지 확인
console.log(/World$/.test(str1)); // true
console.log(/World$/.test(str2)); // false

// .txt로 끝나는 파일명 찾기
const filename = 'document.txt';
console.log(/\.txt$/.test(filename)); // true`,
  },
  {
    id: 'regex-dot',
    name: '. (점)',
    category: '정규표현식 규칙',
    definition: '임의의 한 문자를 나타낸다',
    description: '.는 줄바꿈을 제외한 임의의 한 문자를 의미합니다.',
    code: `const str = 'cat bat hat';

// .at 패턴 (임의의 문자 + at)
const matches = str.match(/.at/g);
console.log(matches); // ["cat", "bat", "hat"]

// 실제 점(.)을 찾으려면 이스케이프 필요
const filename = 'file.txt';
console.log(/file\.txt/.test(filename)); // true
console.log(/file.txt/.test(filename)); // true (하지만 .은 임의의 문자로 해석됨)`,
  },
  {
    id: 'regex-digit',
    name: '\\d (숫자)',
    category: '정규표현식 규칙',
    definition: '숫자(0-9)를 나타낸다',
    description: '\\d는 0부터 9까지의 숫자 하나를 의미합니다.',
    code: `const str = 'Phone: 010-1234-5678';

// 숫자 찾기
const digits = str.match(/\d/g);
console.log(digits); // ["0", "1", "0", "1", "2", "3", "4", "5", "6", "7", "8"]

// 연속된 숫자 찾기
const numbers = str.match(/\d+/g);
console.log(numbers); // ["010", "1234", "5678"]

// 숫자가 아닌 문자 찾기 (\\D)
const nonDigits = str.match(/\D/g);
console.log(nonDigits); // ["P", "h", "o", "n", "e", ":", " ", "-", "-"]`,
  },
  {
    id: 'regex-word',
    name: '\\w (단어 문자)',
    category: '정규표현식 규칙',
    definition: '단어 문자(알파벳, 숫자, 언더스코어)를 나타낸다',
    description: '\\w는 [a-zA-Z0-9_]와 동일합니다.',
    code: `const str = 'Hello_World123!';

// 단어 문자 찾기
const wordChars = str.match(/\w/g);
console.log(wordChars); // ["H", "e", "l", "l", "o", "_", "W", "o", "r", "l", "d", "1", "2", "3"]

// 단어가 아닌 문자 찾기 (\\W)
const nonWordChars = str.match(/\W/g);
console.log(nonWordChars); // ["!"]`,
  },
  {
    id: 'regex-whitespace',
    name: '\\s (공백)',
    category: '정규표현식 규칙',
    definition: '공백 문자(스페이스, 탭, 줄바꿈 등)를 나타낸다',
    description: '\\s는 공백, 탭, 줄바꿈 등의 공백 문자를 의미합니다.',
    code: `const str = 'Hello World\nJavaScript\t2024';

// 공백 문자 찾기
const spaces = str.match(/\s/g);
console.log(spaces); // [" ", "\\n", "\\t"]

// 공백이 아닌 문자 찾기 (\\S)
const nonSpaces = str.match(/\S/g);
console.log(nonSpaces); // ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d", ...]`,
  },
  {
    id: 'regex-char-class',
    name: '[abc] (문자 클래스)',
    category: '정규표현식 규칙',
    definition: '대괄호 안의 문자 중 하나와 일치한다',
    description: '[abc]는 a, b, c 중 하나와 일치합니다.',
    code: `const str = 'apple banana cherry';

// [abc] 패턴 (a, b, c 중 하나)
const matches = str.match(/[abc]/g);
console.log(matches); // ["a", "p", "p", "a", "b", "a", "a", "c"]

// [^abc] 패턴 (a, b, c가 아닌 문자)
const nonMatches = str.match(/[^abc\s]/g);
console.log(nonMatches); // ["p", "p", "l", "e", "n", "n", "r", "r", "y"]`,
  },
  {
    id: 'regex-range',
    name: '[0-9] (범위)',
    category: '정규표현식 규칙',
    definition: '대괄호 안의 범위에 있는 문자와 일치한다',
    description:
      '[0-9]는 0부터 9까지의 숫자, [a-z]는 소문자 알파벳을 의미합니다.',
    code: `const str = 'Hello123World456';

// 숫자 범위 [0-9]
const digits = str.match(/[0-9]/g);
console.log(digits); // ["1", "2", "3", "4", "5", "6"]

// 소문자 범위 [a-z]
const lowerCase = str.match(/[a-z]/g);
console.log(lowerCase); // ["e", "l", "l", "o", "o", "r", "l", "d"]

// 대문자 범위 [A-Z]
const upperCase = str.match(/[A-Z]/g);
console.log(upperCase); // ["H", "W"]

// 여러 범위 조합 [a-zA-Z0-9]
const alphanumeric = str.match(/[a-zA-Z0-9]/g);
console.log(alphanumeric); // ["H", "e", "l", "l", "o", "1", "2", "3", ...]`,
  },
  {
    id: 'regex-quantifier',
    name: '수량자 (*, +, ?, {})',
    category: '정규표현식 규칙',
    definition: '앞의 패턴이 반복되는 횟수를 지정한다',
    description:
      '* (0개 이상), + (1개 이상), ? (0개 또는 1개), {n} (정확히 n개), {n,m} (n개 이상 m개 이하)',
    code: `const str = 'aa aaa aaaa b';

// * (0개 이상)
console.log(str.match(/a*/g)); // ["aa", "", "aaa", "", "aaaa", "", "", ""]

// + (1개 이상)
console.log(str.match(/a+/g)); // ["aa", "aaa", "aaaa"]

// ? (0개 또는 1개)
console.log(str.match(/a?/g)); // ["a", "a", "", "a", "a", "a", "", ...]

// {n} (정확히 n개)
console.log(str.match(/a{3}/g)); // ["aaa", "aaa"]

// {n,m} (n개 이상 m개 이하)
console.log(str.match(/a{2,3}/g)); // ["aa", "aaa", "aaa"]

// {n,} (n개 이상)
console.log(str.match(/a{2,}/g)); // ["aa", "aaa", "aaaa"]`,
  },
  {
    id: 'regex-alternation',
    name: '| (또는)',
    category: '정규표현식 규칙',
    definition: '여러 패턴 중 하나와 일치한다',
    description: '|는 OR 연산자로, 여러 패턴 중 하나와 일치하면 됩니다.',
    code: `const str = 'cat dog bird';

// cat 또는 dog
const matches = str.match(/cat|dog/g);
console.log(matches); // ["cat", "dog"]

// 괄호와 함께 사용하여 그룹화
const text = 'color colour';
const colorMatches = text.match(/colou?r/g);
console.log(colorMatches); // ["color", "colour"]`,
  },
];

const commonRegexPatterns: CodeExampleItem[] = [
  {
    id: 'regex-contains-number',
    name: '숫자를 포함하는 문자',
    category: '자주 사용하는 정규표현식',
    definition: '문자열에 숫자가 포함되어 있는지 확인',
    description: '\\d를 사용하여 숫자가 포함되어 있는지 검증합니다.',
    code: `const containsNumber = (str) => {
  return /\d/.test(str);
};

console.log(containsNumber('Hello123')); // true
console.log(containsNumber('Hello')); // false
console.log(containsNumber('abc123def')); // true

// 실제 사용 예시
const password = 'MyPassword123';
if (containsNumber(password)) {
  console.log('비밀번호에 숫자가 포함되어 있습니다.');
}`,
  },
  {
    id: 'regex-only-number',
    name: '숫자만 포함하는 문자',
    category: '자주 사용하는 정규표현식',
    definition: '문자열이 숫자로만 구성되어 있는지 확인',
    description:
      '^와 $를 사용하여 전체 문자열이 숫자로만 구성되어 있는지 검증합니다.',
    code: `const isOnlyNumber = (str) => {
  return /^\d+$/.test(str);
};

console.log(isOnlyNumber('12345')); // true
console.log(isOnlyNumber('123abc')); // false
console.log(isOnlyNumber('12.34')); // false
console.log(isOnlyNumber('')); // false

// 전화번호 검증 (하이픈 포함)
const isValidPhone = (phone) => {
  return /^010-\d{4}-\d{4}$/.test(phone);
};

console.log(isValidPhone('010-1234-5678')); // true
console.log(isValidPhone('010-123-4567')); // false`,
  },
  {
    id: 'regex-float',
    name: '부동소수점 문자',
    category: '자주 사용하는 정규표현식',
    definition: '문자열이 유효한 부동소수점 숫자인지 확인',
    description: '정수와 소수점을 포함한 숫자 형식을 검증합니다.',
    code: `const isFloat = (str) => {
  return /^-?\d+\.\d+$/.test(str);
};

console.log(isFloat('3.14')); // true
console.log(isFloat('-3.14')); // true
console.log(isFloat('123')); // false
console.log(isFloat('3.14.5')); // false

// 정수 또는 부동소수점 모두 허용
const isNumber = (str) => {
  return /^-?\d+(\.\d+)?$/.test(str);
};

console.log(isNumber('123')); // true
console.log(isNumber('3.14')); // true
console.log(isNumber('-42.5')); // true
console.log(isNumber('abc')); // false`,
  },
  {
    id: 'regex-alphanumeric',
    name: '숫자와 알파벳만을 포함하는 문자',
    category: '자주 사용하는 정규표현식',
    definition: '문자열이 숫자와 알파벳으로만 구성되어 있는지 확인',
    description: '[a-zA-Z0-9] 또는 \\w를 사용하여 알파벳과 숫자만 허용합니다.',
    code: `const isAlphanumeric = (str) => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

console.log(isAlphanumeric('Hello123')); // true
console.log(isAlphanumeric('Hello World')); // false (공백 포함)
console.log(isAlphanumeric('Hello_123')); // false (언더스코어 포함)
console.log(isAlphanumeric('Hello@123')); // false (특수문자 포함)

// 언더스코어도 허용하는 경우
const isAlphanumericWithUnderscore = (str) => {
  return /^[a-zA-Z0-9_]+$/.test(str);
};

console.log(isAlphanumericWithUnderscore('Hello_123')); // true

// \\w 사용 (단어 문자: 알파벳, 숫자, 언더스코어)
const isWordChars = (str) => {
  return /^\\w+$/.test(str);
};

console.log(isWordChars('Hello_123')); // true`,
  },
  {
    id: 'regex-query-string',
    name: '질의 문자열',
    category: '자주 사용하는 정규표현식',
    definition: 'URL의 쿼리 문자열에서 파라미터를 추출',
    description:
      '정규표현식을 사용하여 URL 쿼리 문자열에서 키-값 쌍을 추출합니다.',
    code: `const url = 'https://example.com?name=John&age=30&city=Seoul';

// 쿼리 파라미터 추출 함수
const getQueryParams = (url) => {
  const params = {};
  const queryString = url.split('?')[1];
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  }
  
  return params;
};

console.log(getQueryParams(url));
// { name: "John", age: "30", city: "Seoul" }

// 정규표현식을 사용한 방법
const getQueryParamsRegex = (url) => {
  const params = {};
  const regex = /[?&]([^=]+)=([^&]*)/g;
  let match;
  
  while ((match = regex.exec(url)) !== null) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  
  return params;
};

console.log(getQueryParamsRegex(url));
// { name: "John", age: "30", city: "Seoul" }`,
  },
];

const encodingTopics: AccordionItem[] = [
  {
    id: 'encoding-1',
    title: '인코딩이란',
    content: {
      concept: '인코딩은 데이터를 다른 형식으로 변환하는 과정',
      description:
        '인코딩은 데이터를 전송하거나 저장하기 위해 다른 형식으로 변환하는 과정입니다. 디코딩은 그 반대 과정입니다.',
      list: [
        '인코딩: 데이터를 특정 형식으로 변환',
        '디코딩: 인코딩된 데이터를 원래 형식으로 복원',
        'Base64는 바이너리 데이터를 텍스트로 변환하는 인코딩 방식',
        'URL 인코딩은 특수문자를 안전하게 전송하기 위한 방식',
      ],
    },
  },
];

const base64Methods: CodeExampleItem[] = [
  {
    id: 'btoa',
    name: 'btoa()',
    category: 'Base64 인코딩',
    definition: '문자열을 Base64로 인코딩한다',
    description:
      'btoa()는 바이너리 문자열을 Base64 인코딩된 ASCII 문자열로 변환합니다. 브라우저 환경에서 사용 가능합니다.',
    code: `// 문자열을 Base64로 인코딩
const text = 'Hello World';
const encoded = btoa(text);
console.log(encoded); // "SGVsbG8gV29ybGQ="

// 한글 인코딩 (UTF-8 먼저 처리 필요)
const korean = '안녕하세요';
// 브라우저에서는 직접 가능하지만, Node.js에서는 Buffer 사용
const encodedKorean = btoa(unescape(encodeURIComponent(korean)));
console.log(encodedKorean);

// JSON 객체 인코딩
const data = { name: 'John', age: 30 };
const jsonString = JSON.stringify(data);
const encodedData = btoa(jsonString);
console.log(encodedData); // "eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9"`,
  },
  {
    id: 'atob',
    name: 'atob()',
    category: 'Base64 인코딩',
    definition: 'Base64로 인코딩된 문자열을 디코딩한다',
    description:
      'atob()는 Base64 인코딩된 문자열을 원래의 바이너리 문자열로 디코딩합니다.',
    code: `// Base64 문자열 디코딩
const encoded = 'SGVsbG8gV29ybGQ=';
const decoded = atob(encoded);
console.log(decoded); // "Hello World"

// JSON 객체 디코딩
const encodedData = 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9';
const decodedString = atob(encodedData);
const decodedData = JSON.parse(decodedString);
console.log(decodedData); // { name: "John", age: 30 }

// 한글 디코딩
const encodedKorean = btoa(unescape(encodeURIComponent('안녕하세요')));
const decodedKorean = decodeURIComponent(escape(atob(encodedKorean)));
console.log(decodedKorean); // "안녕하세요"`,
  },
];

const stringCompression: CodeExampleItem[] = [
  {
    id: 'compression',
    name: '문자열 단축',
    category: '문자열 단축',
    definition: '문자열을 압축하거나 단축하는 방법',
    description:
      '문자열을 더 짧게 만들기 위한 다양한 방법들이 있습니다. 간단한 압축 알고리즘을 구현할 수 있습니다.',
    code: `// Run-Length Encoding (RLE) - 간단한 압축
const compressRLE = (str) => {
  let result = '';
  let count = 1;
  
  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      result += str[i] + (count > 1 ? count : '');
      count = 1;
    }
  }
  
  return result;
};

const decompressRLE = (str) => {
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const char = str[i];
    let count = '';
    i++;
    
    while (i < str.length && /\d/.test(str[i])) {
      count += str[i];
      i++;
    }
    
    result += char.repeat(count ? parseInt(count) : 1);
  }
  
  return result;
};

const original = 'AAABBC';
const compressed = compressRLE(original);
console.log(compressed); // "A3B2C"

const decompressed = decompressRLE(compressed);
console.log(decompressed); // "AAABBC"

// 문자열 자르기 (말줄임표)
const truncate = (str, maxLength) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

console.log(truncate('Hello World', 8)); // "Hello..."`,
  },
];

const encryptionTopics: AccordionItem[] = [
  {
    id: 'encryption-1',
    title: '암호화란',
    content: {
      concept: '암호화는 데이터를 읽을 수 없도록 변환하는 과정',
      description:
        '암호화는 평문(plaintext)을 암호문(ciphertext)으로 변환하여 데이터를 보호하는 과정입니다. 복호화는 암호문을 다시 평문으로 변환하는 과정입니다.',
      list: [
        '대칭 암호화: 암호화와 복호화에 같은 키 사용',
        '비대칭 암호화: 공개키와 개인키를 사용 (RSA 등)',
        '해시 함수: 단방향 변환 (복호화 불가)',
        '암호화는 데이터 보안의 핵심',
      ],
    },
  },
];

const rsaEncryption: CodeExampleItem[] = [
  {
    id: 'rsa-basic',
    name: 'RSA 암호화 기본 개념',
    category: 'RSA 암호화',
    definition: 'RSA는 공개키 암호화 알고리즘',
    description:
      'RSA는 공개키와 개인키를 사용하는 비대칭 암호화 방식입니다. 공개키로 암호화하고 개인키로 복호화합니다.',
    code: `// RSA 암호화는 복잡하므로 실제 구현은 crypto 라이브러리 사용
// 여기서는 개념 설명을 위한 예시

// RSA의 기본 원리
// 1. 두 개의 큰 소수 p, q 선택
// 2. n = p * q 계산
// 3. 공개키 (e, n) 생성
// 4. 개인키 (d, n) 생성

// 간단한 예시 (실제로는 매우 큰 수 사용)
const p = 3;
const q = 11;
const n = p * q; // 33
const e = 3; // 공개키 지수
const d = 7; // 개인키 지수

// 암호화 함수 (실제로는 모듈러 연산 사용)
const encrypt = (message, publicKey) => {
  // 실제 구현에서는 crypto.subtle.encrypt 사용
  console.log('암호화:', message, 'with', publicKey);
  return 'encrypted_data';
};

// 복호화 함수
const decrypt = (encrypted, privateKey) => {
  // 실제 구현에서는 crypto.subtle.decrypt 사용
  console.log('복호화:', encrypted, 'with', privateKey);
  return 'decrypted_data';
};

// 사용 예시
const message = 'Hello';
const encrypted = encrypt(message, { e, n });
const decrypted = decrypt(encrypted, { d, n });

console.log('원본:', message);
console.log('암호화:', encrypted);
console.log('복호화:', decrypted);

// 실제 사용 시 (Web Crypto API)
// const keyPair = await crypto.subtle.generateKey(
//   { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
//   true,
//   ['encrypt', 'decrypt']
// );`,
  },
];

export default function StringsScreen() {
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

            {/* 문자열 함수 섹션 */}
            {topic.content.isSection && topic.id === '2' && (
              <>
                {stringFunctions.map((func) => (
                  <FunctionAccordion
                    key={func.id}
                    item={func}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {/* 정규표현식 섹션 */}
            {topic.content.isSection && topic.id === '3' && (
              <>
                {regexTopics.map((regexTopic) => (
                  <TopicAccordion
                    key={regexTopic.id}
                    topic={regexTopic}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="RegExp 객체 및 String 메서드" />
                {regexMethods.map((method) => (
                  <FunctionAccordion
                    key={method.id}
                    item={method}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="정규표현식 규칙" />
                {regexRules.map((rule) => (
                  <FunctionAccordion
                    key={rule.id}
                    item={rule}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="자주 사용하는 정규표현식" />
                {commonRegexPatterns.map((pattern) => (
                  <FunctionAccordion
                    key={pattern.id}
                    item={pattern}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {/* 인코딩 섹션 */}
            {topic.content.isSection && topic.id === '4' && (
              <>
                {encodingTopics.map((encodingTopic) => (
                  <TopicAccordion
                    key={encodingTopic.id}
                    topic={encodingTopic}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="Base64 인코딩" />
                {base64Methods.map((method) => (
                  <FunctionAccordion
                    key={method.id}
                    item={method}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="문자열 단축" />
                {stringCompression.map((compression) => (
                  <FunctionAccordion
                    key={compression.id}
                    item={compression}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {/* 암호화 섹션 */}
            {topic.content.isSection && topic.id === '5' && (
              <>
                {encryptionTopics.map((encryptionTopic) => (
                  <TopicAccordion
                    key={encryptionTopic.id}
                    topic={encryptionTopic}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
                <SectionTitle title="RSA 암호화" />
                {rsaEncryption.map((rsa) => (
                  <FunctionAccordion
                    key={rsa.id}
                    item={rsa}
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
