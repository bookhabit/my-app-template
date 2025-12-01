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
    title: '자바스크립트 배열이란',
    content: {
      concept:
        '배열(Array)은 여러 개의 값을 순서 있게 나열해 저장하는 자료구조',
      description:
        '값에 순서(order)가 있고, 인덱스(index)로 접근할 수 있고, 같은 의미의 데이터 여러 개를 묶어두는 방식',
      list: [
        '자바스크립트의 배열은 진짜 배열(Array)이 아니다',
        '대부분의 언어(C, Java)의 배열은 연속된 메모리 블록을 기반으로 함',
        '하지만 JavaScript 배열은 해시 테이블(객체) 기반의 리스트에 가깝다',
        '요소들이 연속된 메모리에 배치되지 않을 수 있음',
        '동적 크기(Dynamic Size) - 배열 길이가 자동으로 늘어남',
        '타입이 섞여도 OK - const arr = [1, "text", true, { a: 1 }]',
        '배열도 결국 객체(Object) - typeof [] === "object" // true',
      ],
      examples: [
        {
          code: `// Fast Elements (Dense Elements)
// 실제 배열처럼 메모리가 연속되게 저장
// 원시 타입이 섞여 있지 않고, 인덱스가 촘촘할 때 유지됨
const arr1 = [1, 2, 3, 4, 5]; // 가장 빠른 모드

// Dictionary Elements (Sparse Elements)
// 빈 인덱스가 많거나 요소 타입이 다양하면 객체(해시)처럼 저장
const arr2 = [];
arr2[0] = 1;
arr2[100] = 2; // 느림, Map/Object에 가까움`,
        },
      ],
    },
  },
  {
    id: '2',
    title: '배열 기본 연산',
    content: {
      isSection: true,
    },
  },
  {
    id: '2-1',
    title: '반복',
    content: {
      isSection: true,
    },
  },
  {
    id: '3',
    title: '원본 배열을 변경하는 함수',
    content: {
      isSection: true,
    },
  },
  {
    id: '4',
    title: '원본 배열을 변경하지 않는 함수',
    content: {
      isSection: true, // 섹션 제목임을 표시
    },
  },
];

const basicOperations: CodeExampleItem[] = [
  {
    id: 'insert',
    name: '삽입',
    definition: '새로운 항목을 배열에 추가하는 연산',
    description:
      '배열의 끝이나 앞에 새로운 요소를 추가할 수 있습니다. push()는 끝에, unshift()는 앞에 추가합니다.',
    code: `const arr = [1, 2, 3];

// push() - 배열 끝에 추가
arr.push(4);
console.log(arr); // [1, 2, 3, 4]

// 여러 요소 추가
arr.push(5, 6);
console.log(arr); // [1, 2, 3, 4, 5, 6]

// unshift() - 배열 앞에 추가
arr.unshift(0);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6]

// 여러 요소 앞에 추가
arr.unshift(-2, -1);
console.log(arr); // [-2, -1, 0, 1, 2, 3, 4, 5, 6]`,
  },
  {
    id: 'delete',
    name: '삭제',
    definition: '배열에서 항목을 제거하는 연산',
    description:
      '배열의 끝이나 앞에서 요소를 제거할 수 있습니다. pop()은 마지막 요소를, shift()는 첫 번째 요소를 제거합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// pop() - 마지막 요소 제거
const last = arr.pop();
console.log(last); // 5
console.log(arr); // [1, 2, 3, 4]

// shift() - 첫 번째 요소 제거
const first = arr.shift();
console.log(first); // 1
console.log(arr); // [2, 3, 4]

// 빈 배열에서 pop()/shift() 호출
const empty = [];
const result = empty.pop();
console.log(result); // undefined`,
  },
  {
    id: 'access',
    name: '접근',
    definition: '인덱스를 사용해 메모리의 주소로부터 직접 값을 얻는 연산',
    description:
      '배열의 특정 위치에 있는 요소에 인덱스를 통해 직접 접근할 수 있습니다. O(1) 시간 복잡도를 가집니다.',
    code: `const arr = [10, 20, 30, 40, 50];

// 인덱스로 접근 (0부터 시작)
const first = arr[0]; // 10
const third = arr[2]; // 30
const last = arr[arr.length - 1]; // 50

// 존재하지 않는 인덱스 접근
const outOfRange = arr[10]; // undefined

// 값 수정
arr[1] = 25;
console.log(arr); // [10, 25, 30, 40, 50]

// 음수 인덱스는 사용 불가 (Python과 다름)
const negative = arr[-1]; // undefined

// 동적 접근
const index = 2;
const value = arr[index]; // 30`,
  },
];

const loopMethods: CodeExampleItem[] = [
  {
    id: 'for',
    name: 'for문',
    definition: '전통적인 반복문, 인덱스 기반 접근',
    description:
      '가장 기본적인 반복문으로, 시작값, 조건, 증감식을 명시적으로 제어할 수 있습니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 기본 for문
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]); // 1, 2, 3, 4, 5
}

// 인덱스와 값 모두 접근
for (let i = 0; i < arr.length; i++) {
  console.log(\`인덱스: \${i}, 값: \${arr[i]}\`);
}

// 역순 반복
for (let i = arr.length - 1; i >= 0; i--) {
  console.log(arr[i]); // 5, 4, 3, 2, 1
}

// break로 조기 종료
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 3) break;
  console.log(arr[i]); // 1, 2
}

// continue로 건너뛰기
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 3) continue;
  console.log(arr[i]); // 1, 2, 4, 5
}`,
  },
  {
    id: 'while',
    name: 'while문',
    definition: '조건이 true인 동안 반복하는 반복문',
    description:
      '조건만으로 반복을 제어하며, 조건이 false가 될 때까지 반복합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 기본 while문
let i = 0;
while (i < arr.length) {
  console.log(arr[i]);
  i++;
}

// 조건에 따라 조기 종료
let j = 0;
while (j < arr.length) {
  if (arr[j] === 3) break; // 3을 만나면 종료
  console.log(arr[j]); // 1, 2
  j++;
}

// do-while (최소 한 번은 실행)
let k = 0;
do {
  console.log(arr[k]);
  k++;
} while (k < arr.length);`,
  },
  {
    id: 'forin',
    name: 'for in 문',
    definition: '객체의 속성이나 배열의 인덱스를 순회하는 반복문',
    description:
      '객체의 열거 가능한 속성이나 배열의 인덱스를 순회합니다. 배열에 사용 시 인덱스는 문자열로 반환됩니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 배열 인덱스 순회
for (let index in arr) {
  console.log(index, arr[index]);
  // "0 1", "1 2", "2 3", "3 4", "4 5"
}

// 주의: 인덱스는 문자열 타입
for (let index in arr) {
  console.log(typeof index); // "string"
}

// 객체에서 사용 (권장)
const obj = { a: 1, b: 2, c: 3 };
for (let key in obj) {
  console.log(key, obj[key]);
  // "a 1", "b 2", "c 3"
}

// 배열에 추가된 속성도 순회됨
arr.customProp = 'custom';
for (let key in arr) {
  console.log(key); // "0", "1", "2", "3", "4", "customProp"
}`,
  },
  {
    id: 'forof',
    name: 'for of 문',
    definition: '이터러블 객체의 값을 직접 순회하는 반복문',
    description:
      '배열의 값을 직접 순회하며, break와 continue를 사용할 수 있어 가장 권장되는 방법입니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 기본 사용
for (let value of arr) {
  console.log(value); // 1, 2, 3, 4, 5
}

// break로 조기 종료
for (let value of arr) {
  if (value === 3) break;
  console.log(value); // 1, 2
}

// continue로 건너뛰기
for (let value of arr) {
  if (value === 3) continue;
  console.log(value); // 1, 2, 4, 5
}

// 인덱스도 필요하면 entries() 사용
for (let [index, value] of arr.entries()) {
  console.log(index, value);
  // "0 1", "1 2", "2 3", "3 4", "4 5"
}

// 문자열도 순회 가능
for (let char of 'hello') {
  console.log(char); // "h", "e", "l", "l", "o"
}

// Set, Map도 순회 가능
const set = new Set([1, 2, 3]);
for (let value of set) {
  console.log(value); // 1, 2, 3
}`,
  },
  {
    id: 'forEach',
    name: 'forEach문',
    definition: '배열 메서드, 각 요소에 함수를 적용하는 반복문',
    description:
      '배열의 각 요소에 대해 콜백 함수를 실행합니다. break나 continue를 사용할 수 없으며, return으로 현재 반복만 종료할 수 있습니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 기본 사용
arr.forEach((value, index) => {
  console.log(index, value);
  // "0 1", "1 2", "2 3", "3 4", "4 5"
});

// 인덱스 없이 값만 사용
arr.forEach((value) => {
  console.log(value); // 1, 2, 3, 4, 5
});

// 원본 배열도 접근 가능 (세 번째 매개변수)
arr.forEach((value, index, array) => {
  console.log(value, array.length);
});

// return으로 현재 반복만 종료 (break 아님)
arr.forEach((value) => {
  if (value === 3) return; // 현재 반복만 종료
  console.log(value); // 1, 2, 4, 5
});

// 주의: break/continue 사용 불가
// 중간 종료가 필요하면 for...of 사용

// 화살표 함수 사용
arr.forEach(value => console.log(value * 2)); // 2, 4, 6, 8, 10`,
  },
];

const mutatingFunctions: CodeExampleItem[] = [
  {
    id: 'push',
    name: 'push()',
    category: '추가/삭제',
    definition: '배열의 끝에 하나 이상의 요소를 추가한다',
    description:
      '배열의 마지막에 요소를 추가하고, 새로운 배열의 길이를 반환합니다. 원본 배열을 변경합니다.',
    code: `const arr = [1, 2, 3];

// 단일 요소 추가
arr.push(4);
console.log(arr); // [1, 2, 3, 4]

// 여러 요소 추가
const newLength = arr.push(5, 6, 7);
console.log(newLength); // 7
console.log(arr); // [1, 2, 3, 4, 5, 6, 7]

// 반환값 활용
const arr2 = [];
arr2.push(1, 2, 3);
console.log(arr2.length); // 3

// 원본 배열 변경됨
const original = [1, 2];
original.push(3);
console.log(original); // [1, 2, 3]`,
  },
  {
    id: 'pop',
    name: 'pop()',
    category: '추가/삭제',
    definition: '배열의 마지막 요소를 제거하고 그 요소를 반환한다',
    description:
      '배열의 마지막 요소를 제거하고, 제거된 요소를 반환합니다. 빈 배열에서는 undefined를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 마지막 요소 제거
const last = arr.pop();
console.log(last); // 5
console.log(arr); // [1, 2, 3, 4]

// 연속으로 제거
const secondLast = arr.pop();
console.log(secondLast); // 4
console.log(arr); // [1, 2, 3]

// 빈 배열에서 호출
const empty = [];
const result = empty.pop();
console.log(result); // undefined

// 스택처럼 사용
const stack = [];
stack.push(1, 2, 3); // [1, 2, 3]
stack.pop(); // 3, stack = [1, 2]
stack.pop(); // 2, stack = [1]`,
  },
  {
    id: 'unshift',
    name: 'unshift()',
    category: '추가/삭제',
    definition: '배열의 앞에 하나 이상의 요소를 추가한다',
    description:
      '배열의 시작 부분에 요소를 추가하고, 새로운 배열의 길이를 반환합니다. 원본 배열을 변경합니다.',
    code: `const arr = [3, 4, 5];

// 단일 요소 앞에 추가
arr.unshift(2);
console.log(arr); // [2, 3, 4, 5]

// 여러 요소 앞에 추가
const newLength = arr.unshift(0, 1);
console.log(newLength); // 6
console.log(arr); // [0, 1, 2, 3, 4, 5]

// 원본 배열 변경됨
const original = [2, 3];
original.unshift(1);
console.log(original); // [1, 2, 3]`,
  },
  {
    id: 'shift',
    name: 'shift()',
    category: '추가/삭제',
    definition: '배열의 첫 번째 요소를 제거하고 그 요소를 반환한다',
    description:
      '배열의 첫 번째 요소를 제거하고, 제거된 요소를 반환합니다. 빈 배열에서는 undefined를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 첫 번째 요소 제거
const first = arr.shift();
console.log(first); // 1
console.log(arr); // [2, 3, 4, 5]

// 연속으로 제거
const second = arr.shift();
console.log(second); // 2
console.log(arr); // [3, 4, 5]

// 빈 배열에서 호출
const empty = [];
const result = empty.shift();
console.log(result); // undefined

// 큐처럼 사용
const queue = [];
queue.push(1, 2, 3); // [1, 2, 3]
queue.shift(); // 1, queue = [2, 3]
queue.shift(); // 2, queue = [3]`,
  },
  {
    id: 'splice',
    name: 'splice()',
    category: '추가/삭제',
    definition: '원하는 위치에 요소를 추가하거나 제거한다 (가장 많이 쓰임)',
    description:
      '배열의 특정 위치에서 요소를 제거하거나 추가할 수 있습니다. 매우 유연한 메서드입니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 인덱스 2에서 1개 제거
const removed = arr.splice(2, 1);
console.log(removed); // [3]
console.log(arr); // [1, 2, 4, 5]

// 인덱스 1에서 2개 제거
const arr2 = [1, 2, 3, 4, 5];
arr2.splice(1, 2);
console.log(arr2); // [1, 4, 5]

// 인덱스 2에서 1개 제거하고 10 추가
const arr3 = [1, 2, 3, 4, 5];
arr3.splice(2, 1, 10);
console.log(arr3); // [1, 2, 10, 4, 5]

// 인덱스 2에서 0개 제거하고 10, 20 추가 (삽입)
const arr4 = [1, 2, 3, 4, 5];
arr4.splice(2, 0, 10, 20);
console.log(arr4); // [1, 2, 10, 20, 3, 4, 5]

// 음수 인덱스 사용 (뒤에서부터)
const arr5 = [1, 2, 3, 4, 5];
arr5.splice(-2, 1); // 뒤에서 2번째부터 1개 제거
console.log(arr5); // [1, 2, 3, 5]`,
  },
  {
    id: 'sort',
    name: 'sort()',
    category: '정렬/뒤집기',
    definition: '배열의 요소를 정렬한다 (주의: 사본을 만들지 않으면 원본 변경)',
    description:
      '배열의 요소를 정렬합니다. 기본적으로 문자열로 변환하여 정렬하므로, 숫자 정렬 시 비교 함수가 필요합니다.',
    code: `// 문자열 정렬 (기본)
const arr1 = ['banana', 'apple', 'cherry'];
arr1.sort();
console.log(arr1); // ['apple', 'banana', 'cherry']

// 숫자 정렬 (비교 함수 필요)
const arr2 = [3, 1, 4, 1, 5, 9, 2, 6];
arr2.sort(); // 잘못된 결과: [1, 1, 2, 3, 4, 5, 6, 9] (문자열로 정렬)
arr2.sort((a, b) => a - b); // 올바른 오름차순
console.log(arr2); // [1, 1, 2, 3, 4, 5, 6, 9]

// 내림차순 정렬
const arr3 = [3, 1, 4, 1, 5, 9, 2, 6];
arr3.sort((a, b) => b - a);
console.log(arr3); // [9, 6, 5, 4, 3, 2, 1, 1]

// 객체 배열 정렬
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
];
users.sort((a, b) => a.age - b.age);
console.log(users);
// [{ name: 'Jane', age: 25 }, { name: 'John', age: 30 }, { name: 'Bob', age: 35 }]`,
  },
  {
    id: 'reverse',
    name: 'reverse()',
    category: '정렬/뒤집기',
    definition: '배열의 요소 순서를 뒤집는다',
    description:
      '배열의 요소 순서를 역순으로 뒤집습니다. 원본 배열을 변경합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 배열 뒤집기
arr.reverse();
console.log(arr); // [5, 4, 3, 2, 1]

// 다시 뒤집으면 원래대로
arr.reverse();
console.log(arr); // [1, 2, 3, 4, 5]

// 문자열 배열
const words = ['hello', 'world'];
words.reverse();
console.log(words); // ['world', 'hello']`,
  },
  {
    id: 'fill',
    name: 'fill()',
    category: '값 채우기',
    definition: '특정 값으로 전체 또는 일부를 채운다',
    description:
      '배열의 지정된 범위를 특정 값으로 채웁니다. 원본 배열을 변경합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 전체를 0으로 채우기
arr.fill(0);
console.log(arr); // [0, 0, 0, 0, 0]

// 인덱스 1부터 3 전까지 채우기
const arr2 = [1, 2, 3, 4, 5];
arr2.fill(9, 1, 3);
console.log(arr2); // [1, 9, 9, 4, 5]

// 시작 인덱스만 지정 (끝까지)
const arr3 = [1, 2, 3, 4, 5];
arr3.fill(7, 2);
console.log(arr3); // [1, 2, 7, 7, 7]

// 음수 인덱스 사용
const arr4 = [1, 2, 3, 4, 5];
arr4.fill(8, -3); // 뒤에서 3번째부터
console.log(arr4); // [1, 2, 8, 8, 8]`,
  },
  {
    id: 'copyWithin',
    name: 'copyWithin()',
    category: '값 채우기',
    definition: '배열의 일부 구간을 복사하여 다른 위치에 덮어쓴다',
    description:
      '배열 내에서 요소를 복사하여 다른 위치에 붙여넣습니다. 원본 배열을 변경합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 인덱스 0에 인덱스 3부터의 요소 복사
arr.copyWithin(0, 3);
console.log(arr); // [4, 5, 3, 4, 5]

// 인덱스 0에 인덱스 3부터 4 전까지 복사
const arr2 = [1, 2, 3, 4, 5];
arr2.copyWithin(0, 3, 4);
console.log(arr2); // [4, 2, 3, 4, 5]

// 음수 인덱스 사용
const arr3 = [1, 2, 3, 4, 5];
arr3.copyWithin(0, -2); // 뒤에서 2번째부터 끝까지를 0번째에 복사
console.log(arr3); // [4, 5, 3, 4, 5]`,
  },
];

const nonMutatingFunctions: CodeExampleItem[] = [
  {
    id: 'map',
    name: 'map()',
    category: '반환용 새 배열 생성',
    definition:
      '매개변수로 전달된 함수 변환을 배열의 모든 항목에 적용한 다음, 변환이 적용된 항목들을 포함하는 신규 배열을 반환한다',
    description:
      '배열의 각 요소에 함수를 적용하여 새로운 배열을 생성합니다. 원본 배열은 변경되지 않습니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 각 요소를 2배로 변환
const doubled = arr.map(x => x * 2);
// [2, 4, 6, 8, 10]

// 각 요소를 문자열로 변환
const strings = arr.map(x => x.toString());
// ["1", "2", "3", "4", "5"]

// 객체 배열 변환
const users = [{ name: 'John', age: 20 }, { name: 'Jane', age: 25 }];
const names = users.map(user => user.name);
// ["John", "Jane"]

// 원본 배열은 변경되지 않음
console.log(arr); // [1, 2, 3, 4, 5]`,
  },
  {
    id: 'filter',
    name: 'filter()',
    category: '반환용 새 배열 생성',
    definition:
      '배열 내 항목들 중 함수의 매개변수로 전달된 조건을 충족시키는 항목들만 반환한다',
    description: '조건을 만족하는 요소만 필터링하여 새로운 배열을 생성합니다.',
    code: `const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 짝수만 필터링
const evens = arr.filter(x => x % 2 === 0);
// [2, 4, 6, 8, 10]

// 5보다 큰 수만 필터링
const greaterThan5 = arr.filter(x => x > 5);
// [6, 7, 8, 9, 10]

// 객체 배열 필터링
const users = [
  { name: 'John', age: 20 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 17 }
];
const adults = users.filter(user => user.age >= 18);
// [{ name: 'John', age: 20 }, { name: 'Jane', age: 25 }]`,
  },
  {
    id: 'slice',
    name: 'slice()',
    category: '반환용 새 배열 생성',
    definition:
      '기존 배열을 수정하지 않고 해당 배열의 일부를 반환한다. 배열의 복사본을 반환하며, 복사한 배열과 원본 배열은 동등 연산자로 비교 시 false (메모리 주소가 다르기 때문)',
    description:
      '배열의 일부분을 추출하여 새로운 배열을 반환합니다. 원본 배열은 변경되지 않습니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 인덱스 1부터 3 전까지 (3은 포함 안 됨)
const sliced = arr.slice(1, 3);
// [2, 3]

// 시작 인덱스만 지정 (끝까지)
const fromIndex2 = arr.slice(2);
// [3, 4, 5]

// 전체 복사
const copy = arr.slice();
// [1, 2, 3, 4, 5]

// 음수 인덱스 사용 (뒤에서부터)
const lastTwo = arr.slice(-2);
// [4, 5]

// 원본 배열은 변경되지 않음
console.log(arr); // [1, 2, 3, 4, 5]

// 메모리 주소가 다름
console.log(arr === copy); // false
console.log(arr === arr.slice()); // false`,
  },
  {
    id: 'concat',
    name: 'concat()',
    category: '반환용 새 배열 생성',
    definition: '여러 배열을 합쳐서 새로운 배열을 반환한다',
    description: '두 개 이상의 배열을 결합하여 새로운 배열을 생성합니다.',
    code: `const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const arr3 = [7, 8, 9];

// 두 배열 결합
const combined = arr1.concat(arr2);
// [1, 2, 3, 4, 5, 6]

// 여러 배열 결합
const all = arr1.concat(arr2, arr3);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 값과 배열 결합
const withValues = arr1.concat(4, 5, [6, 7]);
// [1, 2, 3, 4, 5, 6, 7]

// 원본 배열은 변경되지 않음
console.log(arr1); // [1, 2, 3]`,
  },
  {
    id: 'flat',
    name: 'flat()',
    category: '반환용 새 배열 생성',
    definition: '중첩된 배열을 평탄화하여 새로운 배열을 반환한다',
    description: '배열의 깊이를 지정하여 평탄화합니다. 기본값은 1입니다.',
    code: `const nested = [1, 2, [3, 4], [5, [6, 7]]];

// 기본값 (깊이 1)
const flat1 = nested.flat();
// [1, 2, 3, 4, 5, [6, 7]]

// 깊이 2
const flat2 = nested.flat(2);
// [1, 2, 3, 4, 5, 6, 7]

// 모든 깊이 평탄화
const flatAll = nested.flat(Infinity);
// [1, 2, 3, 4, 5, 6, 7]

// 빈 슬롯 제거
const withHoles = [1, , 3, [4, , 6]];
const flattened = withHoles.flat();
// [1, 3, 4, 6]`,
  },
  {
    id: 'flatMap',
    name: 'flatMap()',
    category: '반환용 새 배열 생성',
    definition: 'map()과 flat(1)을 순차적으로 실행한 것과 동일하다',
    description: '각 요소에 함수를 적용한 후 결과를 1단계 평탄화합니다.',
    code: `const arr = [1, 2, 3, 4];

// map + flat 조합
const doubled = arr.map(x => [x * 2]).flat();
// [2, 4, 6, 8]

// flatMap 사용 (더 간단)
const doubled2 = arr.flatMap(x => [x * 2]);
// [2, 4, 6, 8]

// 여러 요소로 확장
const expanded = arr.flatMap(x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6, 4, 8]

// 문자열 분리
const words = ['hello world', 'foo bar'];
const split = words.flatMap(word => word.split(' '));
// ["hello", "world", "foo", "bar"]`,
  },
  {
    id: 'toReversed',
    name: 'toReversed()',
    category: '반환용 새 배열 생성',
    definition: 'reverse()의 비변형 버전으로, 뒤집힌 새 배열을 반환한다',
    description:
      '배열을 뒤집은 새로운 배열을 반환합니다. 원본 배열은 변경되지 않습니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 뒤집힌 새 배열 반환
const reversed = arr.toReversed();
// [5, 4, 3, 2, 1]

// 원본 배열은 변경되지 않음
console.log(arr); // [1, 2, 3, 4, 5]

// reverse()와 비교
const arr2 = [1, 2, 3];
arr2.reverse(); // 원본 변경
console.log(arr2); // [3, 2, 1]`,
  },
  {
    id: 'toSorted',
    name: 'toSorted()',
    category: '반환용 새 배열 생성',
    definition: 'sort()의 비변형 버전으로, 정렬된 새 배열을 반환한다',
    description:
      '배열을 정렬한 새로운 배열을 반환합니다. 원본 배열은 변경되지 않습니다.',
    code: `const arr = [3, 1, 4, 1, 5, 9, 2, 6];

// 오름차순 정렬
const sorted = arr.toSorted();
// [1, 1, 2, 3, 4, 5, 6, 9]

// 내림차순 정렬
const descending = arr.toSorted((a, b) => b - a);
// [9, 6, 5, 4, 3, 2, 1, 1]

// 객체 배열 정렬
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
];
const sortedByAge = users.toSorted((a, b) => a.age - b.age);
// [{ name: 'Jane', age: 25 }, { name: 'John', age: 30 }, { name: 'Bob', age: 35 }]

// 원본 배열은 변경되지 않음
console.log(arr); // [3, 1, 4, 1, 5, 9, 2, 6]`,
  },
  {
    id: 'toSpliced',
    name: 'toSpliced()',
    category: '반환용 새 배열 생성',
    definition:
      'splice()의 비변형 버전으로, 요소를 추가/삭제한 새 배열을 반환한다',
    description: '배열의 요소를 추가하거나 제거한 새로운 배열을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 인덱스 2에서 1개 제거
const removed = arr.toSpliced(2, 1);
// [1, 2, 4, 5]

// 인덱스 2에서 1개 제거하고 10 추가
const replaced = arr.toSpliced(2, 1, 10);
// [1, 2, 10, 4, 5]

// 인덱스 2에서 0개 제거하고 10, 20 추가
const inserted = arr.toSpliced(2, 0, 10, 20);
// [1, 2, 10, 20, 3, 4, 5]

// 원본 배열은 변경되지 않음
console.log(arr); // [1, 2, 3, 4, 5]`,
  },
  {
    id: 'find',
    name: 'find()',
    category: '탐색 관련 (불변)',
    definition: '조건을 만족하는 첫 번째 요소를 반환한다',
    description:
      '조건을 만족하는 첫 번째 요소를 찾아 반환합니다. 없으면 undefined를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 3보다 큰 첫 번째 요소
const found = arr.find(x => x > 3);
// 4

// 객체 배열에서 찾기
const users = [
  { id: 1, name: 'John', age: 20 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Bob', age: 30 }
];
const user = users.find(u => u.age > 22);
// { id: 2, name: 'Jane', age: 25 }

// 찾지 못하면 undefined
const notFound = arr.find(x => x > 10);
// undefined`,
  },
  {
    id: 'findIndex',
    name: 'findIndex()',
    category: '탐색 관련 (불변)',
    definition: '조건을 만족하는 첫 번째 요소의 인덱스를 반환한다',
    description:
      '조건을 만족하는 첫 번째 요소의 인덱스를 반환합니다. 없으면 -1을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 3보다 큰 첫 번째 요소의 인덱스
const index = arr.findIndex(x => x > 3);
// 3

// 객체 배열에서 찾기
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
];
const userIndex = users.findIndex(u => u.name === 'Jane');
// 1

// 찾지 못하면 -1
const notFound = arr.findIndex(x => x > 10);
// -1`,
  },
  {
    id: 'findLast',
    name: 'findLast()',
    category: '탐색 관련 (불변)',
    definition: '조건을 만족하는 마지막 요소를 반환한다',
    description:
      '배열을 뒤에서부터 검색하여 조건을 만족하는 마지막 요소를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5, 4, 3];

// 3보다 큰 마지막 요소
const found = arr.findLast(x => x > 3);
// 4 (마지막 4)

// 객체 배열에서 찾기
const users = [
  { id: 1, name: 'John', active: true },
  { id: 2, name: 'Jane', active: false },
  { id: 3, name: 'Bob', active: true }
];
const lastActive = users.findLast(u => u.active);
// { id: 3, name: 'Bob', active: true }`,
  },
  {
    id: 'findLastIndex',
    name: 'findLastIndex()',
    category: '탐색 관련 (불변)',
    definition: '조건을 만족하는 마지막 요소의 인덱스를 반환한다',
    description:
      '배열을 뒤에서부터 검색하여 조건을 만족하는 마지막 요소의 인덱스를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5, 4, 3];

// 3보다 큰 마지막 요소의 인덱스
const index = arr.findLastIndex(x => x > 3);
// 5

// 찾지 못하면 -1
const notFound = arr.findLastIndex(x => x > 10);
// -1`,
  },
  {
    id: 'indexOf',
    name: 'indexOf()',
    category: '탐색 관련 (불변)',
    definition: '특정 값과 일치하는 첫 번째 요소의 인덱스를 반환한다',
    description:
      '값을 검색하여 첫 번째로 나타나는 인덱스를 반환합니다. 없으면 -1을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5, 2];

// 값 2의 첫 번째 인덱스
const index = arr.indexOf(2);
// 1

// 시작 인덱스 지정
const indexFrom3 = arr.indexOf(2, 3);
// 5

// 찾지 못하면 -1
const notFound = arr.indexOf(10);
// -1

// 객체는 참조로 비교
const obj = { a: 1 };
const arr2 = [{ a: 1 }, obj, { a: 1 }];
const objIndex = arr2.indexOf(obj);
// 1 (같은 참조만 찾음)`,
  },
  {
    id: 'lastIndexOf',
    name: 'lastIndexOf()',
    category: '탐색 관련 (불변)',
    definition: '특정 값과 일치하는 마지막 요소의 인덱스를 반환한다',
    description:
      '배열을 뒤에서부터 검색하여 값과 일치하는 마지막 요소의 인덱스를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5, 2];

// 값 2의 마지막 인덱스
const index = arr.lastIndexOf(2);
// 5

// 시작 인덱스 지정 (뒤에서부터)
const indexFrom3 = arr.lastIndexOf(2, 3);
// 1

// 찾지 못하면 -1
const notFound = arr.lastIndexOf(10);
// -1`,
  },
  {
    id: 'includes',
    name: 'includes()',
    category: '탐색 관련 (불변)',
    definition: '배열에 특정 값이 포함되어 있는지 확인한다',
    description: '배열에 특정 요소가 포함되어 있는지 불린 값을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 값 포함 여부 확인
const has3 = arr.includes(3);
// true

const has10 = arr.includes(10);
// false

// 시작 인덱스 지정
const has3FromIndex2 = arr.includes(3, 2);
// true

const has3FromIndex3 = arr.includes(3, 3);
// false

// 문자열 배열
const fruits = ['apple', 'banana', 'orange'];
const hasApple = fruits.includes('apple');
// true`,
  },
  {
    id: 'some',
    name: 'some()',
    category: '탐색 관련 (불변)',
    definition: '배열의 요소 중 하나라도 조건을 만족하면 true를 반환한다',
    description:
      '조건을 만족하는 요소가 하나라도 있으면 true, 모두 만족하지 않으면 false를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 하나라도 3보다 큰가?
const hasGreaterThan3 = arr.some(x => x > 3);
// true

// 하나라도 10보다 큰가?
const hasGreaterThan10 = arr.some(x => x > 10);
// false

// 객체 배열에서 사용
const users = [
  { name: 'John', active: false },
  { name: 'Jane', active: true },
  { name: 'Bob', active: false }
];
const hasActive = users.some(u => u.active);
// true`,
  },
  {
    id: 'every',
    name: 'every()',
    category: '탐색 관련 (불변)',
    definition: '배열의 모든 요소가 조건을 만족하면 true를 반환한다',
    description:
      '모든 요소가 조건을 만족하면 true, 하나라도 만족하지 않으면 false를 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 모두 0보다 큰가?
const allPositive = arr.every(x => x > 0);
// true

// 모두 3보다 큰가?
const allGreaterThan3 = arr.every(x => x > 3);
// false

// 객체 배열에서 사용
const users = [
  { name: 'John', age: 20 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 30 }
];
const allAdults = users.every(u => u.age >= 18);
// true

// 빈 배열은 항상 true
const empty = [];
const result = empty.every(x => x > 0);
// true`,
  },
  {
    id: 'reduce',
    name: 'reduce()',
    category: '탐색 관련 (불변)',
    definition:
      '매개변수로 전달된 변환함수를 사용해 배열의 모든 항목을 하나의 값으로 결합한다',
    description:
      '배열의 각 요소에 대해 함수를 실행하고 하나의 결과값을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 합계 구하기
const sum = arr.reduce((acc, x) => acc + x, 0);
// 15

// 곱 구하기
const product = arr.reduce((acc, x) => acc * x, 1);
// 120

// 최댓값 구하기
const max = arr.reduce((acc, x) => Math.max(acc, x), -Infinity);
// 5

// 객체로 변환
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
];
const userMap = users.reduce((acc, user) => {
  acc[user.id] = user.name;
  return acc;
}, {});
// { 1: 'John', 2: 'Jane' }

// 초기값 없이 사용 (첫 번째 요소가 초기값)
const sum2 = arr.reduce((acc, x) => acc + x);
// 15`,
  },
  {
    id: 'reduceRight',
    name: 'reduceRight()',
    category: '탐색 관련 (불변)',
    definition: 'reduce()와 동일하지만 배열을 오른쪽에서 왼쪽으로 처리한다',
    description: '배열을 뒤에서부터 앞으로 순회하며 하나의 값으로 결합합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 오른쪽에서 왼쪽으로 합계
const sum = arr.reduceRight((acc, x) => acc + x, 0);
// 15

// 배열 평탄화 (오른쪽부터)
const nested = [[0, 1], [2, 3], [4, 5]];
const flattened = nested.reduceRight((acc, val) => acc.concat(val), []);
// [4, 5, 2, 3, 0, 1]

// 문자열 결합 (오른쪽부터)
const words = ['world', 'hello'];
const sentence = words.reduceRight((acc, word) => acc + ' ' + word);
// "world hello"`,
  },
  {
    id: 'join',
    name: 'join()',
    category: '문자열 반환',
    definition: '배열의 모든 요소를 문자열로 결합한다',
    description:
      '배열의 모든 요소를 지정된 구분자로 연결하여 문자열을 반환합니다.',
    code: `const arr = [1, 2, 3, 4, 5];

// 기본 구분자 (쉼표)
const str1 = arr.join();
// "1,2,3,4,5"

// 커스텀 구분자
const str2 = arr.join('-');
// "1-2-3-4-5"

const str3 = arr.join(' ');
// "1 2 3 4 5"

const str4 = arr.join('');
// "12345"

// 빈 배열
const empty = [];
const emptyStr = empty.join('-');
// ""

// 객체 배열 (toString 호출)
const mixed = [1, 'hello', true];
const mixedStr = mixed.join(' | ');
// "1 | hello | true"`,
  },
  {
    id: 'arrayFrom',
    name: 'Array.from()',
    category: '새 배열 생성',
    definition: '유사 배열 객체나 이터러블 객체로부터 새 배열을 생성한다',
    description:
      '유사 배열 객체나 이터러블 객체를 배열로 변환하거나, 길이와 함수를 사용하여 새 배열을 생성합니다.',
    code: `// 문자열을 배열로 변환
const str = 'hello';
const arr1 = Array.from(str);
// ['h', 'e', 'l', 'l', 'o']

// 유사 배열 객체 변환
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const arr2 = Array.from(arrayLike);
// ['a', 'b', 'c']

// 길이와 함수로 배열 생성
const arr3 = Array.from({ length: 5 }, (_, i) => i + 1);
// [1, 2, 3, 4, 5]

// 제곱 배열 생성
const squares = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2);
// [1, 4, 9, 16, 25]

// Set을 배열로 변환
const set = new Set([1, 2, 3]);
const arr4 = Array.from(set);
// [1, 2, 3]

// Map의 키를 배열로
const map = new Map([['a', 1], ['b', 2]]);
const keys = Array.from(map.keys());
// ['a', 'b']`,
  },
];

export default function ArraysScreen() {
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

            {/* 섹션 제목인 경우 그 아래에 항목들 표시 */}
            {topic.content.isSection && topic.id === '2' && (
              <>
                {basicOperations.map((operation) => (
                  <FunctionAccordion
                    key={operation.id}
                    item={operation}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {topic.content.isSection && topic.id === '2-1' && (
              <>
                {loopMethods.map((loop) => (
                  <FunctionAccordion
                    key={loop.id}
                    item={loop}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {topic.content.isSection && topic.id === '3' && (
              <>
                {mutatingFunctions.map((func) => (
                  <FunctionAccordion
                    key={func.id}
                    item={func}
                    executionResults={executionResults}
                    onExecute={executeCode}
                  />
                ))}
              </>
            )}

            {topic.content.isSection && topic.id === '4' && (
              <>
                {nonMutatingFunctions.map((func) => (
                  <FunctionAccordion
                    key={func.id}
                    item={func}
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
