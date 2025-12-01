import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Android에서 LayoutAnimation 활성화
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AnimatedScreen() {
  const { theme } = useTheme();

  // 1. Fade 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [fadeVisible, setFadeVisible] = useState(false);

  // 2. Scale 애니메이션
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 3. Translate 애니메이션
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // 4. ValueXY (드래그)
  const pan = useRef(new Animated.ValueXY()).current;

  // 5. Scroll 기반 Header
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollContent, setScrollContent] = useState(
    Array.from({ length: 30 }, (_, i) => `아이템 ${i + 1}`)
  );

  // 6. Carousel
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselData = ['슬라이드 1', '슬라이드 2', '슬라이드 3'];

  // 7. Heart Scale
  const heartScale = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);

  // Fade In/Out
  const fadeIn = () => {
    setFadeVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setFadeVisible(false));
  };

  // Scale 애니메이션
  const scaleUp = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.5,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const scaleDown = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Translate 애니메이션
  const moveRight = () => {
    Animated.timing(translateXAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const moveLeft = () => {
    Animated.timing(translateXAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Sequence 예제
  const runSequence = () => {
    translateXAnim.setValue(0);
    translateYAnim.setValue(0);
    Animated.sequence([
      Animated.timing(translateXAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Parallel 예제
  const runParallel = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(1);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Loop 예제
  const [isLooping, setIsLooping] = useState(false);
  const loopAnim = useRef(new Animated.Value(0)).current;

  const startLoop = () => {
    setIsLooping(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(loopAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loopAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();
  };

  const stopLoop = () => {
    setIsLooping(false);
    loopAnim.stopAnimation();
  };

  // PanResponder (드래그) - 기본
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // PanResponder 상세 (gestureState 사용)
  const [panStatus, setPanStatus] = useState('');
  const pan2 = useRef(new Animated.ValueXY()).current;

  const panResponder2 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        pan2.setOffset({
          x: (pan2.x as any)._value,
          y: (pan2.y as any)._value,
        });
        setPanStatus(
          `Grant: 시작 좌표 (${gestureState.x0.toFixed(1)}, ${gestureState.y0.toFixed(1)})`
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([null, { dx: pan2.x, dy: pan2.y }], {
          useNativeDriver: false,
        })(evt, gestureState);
        setPanStatus(
          `Move: dx=${gestureState.dx.toFixed(1)}, dy=${gestureState.dy.toFixed(1)}, 속도=(${gestureState.vx.toFixed(2)}, ${gestureState.vy.toFixed(2)})`
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan2.flattenOffset();
        setPanStatus(
          `Release: 총 이동거리 (${gestureState.dx.toFixed(1)}, ${gestureState.dy.toFixed(1)})`
        );
        Animated.spring(pan2, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        setPanStatus('Terminate: 다른 뷰가 응답자로 변경됨');
      },
    })
  ).current;

  // Scroll Header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Carousel
  const carouselInterpolate = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, -SCREEN_WIDTH, -SCREEN_WIDTH * 2],
    extrapolate: 'clamp',
  });

  // Heart Scale
  const handleLike = () => {
    setLiked(!liked);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 2,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 2,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // LayoutAnimation
  const [layoutItems, setLayoutItems] = useState([
    { id: 1, visible: true },
    { id: 2, visible: true },
    { id: 3, visible: true },
    { id: 4, visible: true },
  ]);
  const [layoutExpanded, setLayoutExpanded] = useState(false);

  const toggleLayoutItem = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLayoutItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const toggleLayoutExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setLayoutExpanded(!layoutExpanded);
  };

  // Gesture Responder
  const [responderStatus, setResponderStatus] = useState('대기 중');
  const responderBoxRef = useRef<View>(null);

  const handleResponderGrant = () => {
    setResponderStatus('Grant: 이 뷰가 응답자가 되었습니다');
  };

  const handleResponderMove = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    setResponderStatus(
      `Move: 좌표 (${locationX.toFixed(1)}, ${locationY.toFixed(1)})`
    );
  };

  const handleResponderRelease = () => {
    setResponderStatus('Release: 터치가 끝났습니다');
  };

  const handleResponderTerminate = () => {
    setResponderStatus('Terminate: 응답자가 다른 뷰로 변경되었습니다');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Animated API
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          부드럽고 강력한 애니메이션을 쉽게 만들기 위한 React Native 기본 API
        </TextBox>

        {/* Animated란? */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Animated란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 부드럽고 강력한 애니메이션을 쉽게 만들기 위한 API
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 핵심: Animated.Value 생성 → 스타일 바인딩 → 애니메이션 실행
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • useNativeDriver로 성능 극대화 가능
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • transform, opacity는 Native Driver 지원
            </TextBox>
          </View>
        </View>

        {/* 실무 패턴 1: Fade In/Out */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 실무 패턴: Fade In/Out
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            가장 기본적인 페이드 애니메이션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Fade In"
              onPress={fadeIn}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="Fade Out"
              onPress={fadeOut}
              variant="outline"
              size="small"
            />
          </View>
          {fadeVisible && (
            <Animated.View
              style={[
                styles.animatedBox,
                {
                  backgroundColor: theme.primary,
                  opacity: fadeAnim,
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                Fade 애니메이션
              </TextBox>
            </Animated.View>
          )}
        </View>

        {/* Scale 애니메이션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. Scale 애니메이션 (Spring)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Spring 애니메이션으로 자연스러운 확대/축소
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="확대"
              onPress={scaleUp}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="축소"
              onPress={scaleDown}
              variant="outline"
              size="small"
            />
          </View>
          <Animated.View
            style={[
              styles.animatedBox,
              {
                backgroundColor: theme.secondary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              Scale 애니메이션
            </TextBox>
          </Animated.View>
        </View>

        {/* Translate 애니메이션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. Translate 애니메이션
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            위치 이동 애니메이션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="오른쪽으로"
              onPress={moveRight}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="원위치"
              onPress={moveLeft}
              variant="outline"
              size="small"
            />
          </View>
          <View style={styles.translateContainer}>
            <Animated.View
              style={[
                styles.animatedBox,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateX: translateXAnim }],
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                Translate
              </TextBox>
            </Animated.View>
          </View>
        </View>

        {/* Sequence 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. Sequence (순차 실행)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            애니메이션을 순차적으로 실행
          </TextBox>
          <CustomButton
            title="Sequence 실행"
            onPress={runSequence}
            variant="outline"
            size="small"
            style={styles.toggleButton}
          />
          <View style={styles.translateContainer}>
            <Animated.View
              style={[
                styles.animatedBox,
                {
                  backgroundColor: theme.secondary,
                  transform: [
                    { translateX: translateXAnim },
                    { translateY: translateYAnim },
                  ],
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                Sequence
              </TextBox>
            </Animated.View>
          </View>
        </View>

        {/* Parallel 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. Parallel (동시 실행)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            여러 애니메이션을 동시에 실행
          </TextBox>
          <CustomButton
            title="Parallel 실행"
            onPress={runParallel}
            variant="outline"
            size="small"
            style={styles.toggleButton}
          />
          <Animated.View
            style={[
              styles.animatedBox,
              {
                backgroundColor: theme.primary,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              Parallel
            </TextBox>
          </Animated.View>
        </View>

        {/* Loop 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. Loop (반복 실행)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            애니메이션을 반복 실행
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="시작"
              onPress={startLoop}
              variant={isLooping ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="중지"
              onPress={stopLoop}
              variant={!isLooping ? 'primary' : 'outline'}
              size="small"
            />
          </View>
          <Animated.View
            style={[
              styles.animatedBox,
              {
                backgroundColor: theme.secondary,
                opacity: loopAnim,
                transform: [
                  {
                    scale: loopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              Loop
            </TextBox>
          </Animated.View>
        </View>

        {/* PanResponder (드래그) - 기본 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. PanResponder (드래그) - 기본
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ValueXY를 사용한 드래그 애니메이션
          </TextBox>
          <View style={styles.dragContainer}>
            <Animated.View
              style={[
                styles.draggableBox,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateX: pan.x }, { translateY: pan.y }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <TextBox variant="body2" color="#FFFFFF">
                드래그하세요
              </TextBox>
            </Animated.View>
          </View>
        </View>

        {/* PanResponder 상세 (gestureState) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. PanResponder 상세 (gestureState)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            gestureState를 사용한 상세한 드래그 정보
          </TextBox>
          <View style={styles.dragContainer}>
            <Animated.View
              style={[
                styles.draggableBox,
                {
                  backgroundColor: theme.secondary,
                  transform: [{ translateX: pan2.x }, { translateY: pan2.y }],
                },
              ]}
              {...panResponder2.panHandlers}
            >
              <TextBox variant="body2" color="#FFFFFF">
                드래그하세요
              </TextBox>
            </Animated.View>
          </View>
          {panStatus ? (
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.codeText}
              >
                {panStatus}
              </TextBox>
            </View>
          ) : null}
        </View>

        {/* Gesture Responder System */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            9. Gesture Responder System
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            낮은 수준의 터치 이벤트 처리 및 협상
          </TextBox>
          <View
            ref={responderBoxRef}
            style={[
              styles.responderBox,
              {
                backgroundColor: theme.primary,
                borderColor: theme.border,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={handleResponderGrant}
            onResponderMove={handleResponderMove}
            onResponderRelease={handleResponderRelease}
            onResponderTerminate={handleResponderTerminate}
          >
            <TextBox variant="body2" color="#FFFFFF">
              터치해보세요
            </TextBox>
          </View>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {responderStatus}
            </TextBox>
          </View>
        </View>

        {/* LayoutAnimation */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            10. LayoutAnimation (전역 레이아웃 애니메이션)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Flexbox 레이아웃 업데이트 시 자동으로 애니메이션 처리
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="아이템 토글"
              onPress={() => toggleLayoutItem(1)}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="전체 확장/축소"
              onPress={toggleLayoutExpand}
              variant="outline"
              size="small"
            />
          </View>
          <View style={styles.layoutContainer}>
            {layoutItems.map((item) =>
              item.visible ? (
                <View
                  key={item.id}
                  style={[
                    styles.layoutItem,
                    {
                      backgroundColor: theme.primary + '40',
                      borderColor: theme.primary,
                      height: layoutExpanded ? 80 : 60,
                    },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    아이템 {item.id}
                  </TextBox>
                </View>
              ) : null
            )}
          </View>
        </View>

        {/* 실무 패턴 2: Scroll 기반 Header */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            11. 실무 패턴: Scroll 기반 Header 숨김
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크롤에 따라 헤더가 숨겨지고 나타나는 애니메이션
          </TextBox>
          <View style={styles.scrollContainer}>
            <Animated.View
              style={[
                styles.scrollHeader,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateY: headerTranslateY }],
                  opacity: headerOpacity,
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                스크롤 헤더
              </TextBox>
            </Animated.View>
            <Animated.ScrollView
              style={styles.scrollView}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            >
              {scrollContent.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollItem,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    {item}
                  </TextBox>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
        </View>

        {/* 실무 패턴 3: Carousel */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            12. 실무 패턴: Carousel (Onboarding Slide)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크롤 기반 캐러셀 애니메이션
          </TextBox>
          <View style={styles.carouselContainer}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
            >
              {carouselData.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.carouselSlide,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <TextBox variant="title3" color="#FFFFFF">
                    {item}
                  </TextBox>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
        </View>

        {/* 실무 패턴 4: Heart Scale (좋아요) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            13. 실무 패턴: 좋아요 하트 터질 때 Scale
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            좋아요 버튼을 누를 때 스프링 애니메이션
          </TextBox>
          <View style={styles.heartContainer}>
            <Animated.View
              style={[
                styles.heartBox,
                {
                  backgroundColor: liked ? theme.error : theme.border,
                  transform: [{ scale: heartScale }],
                },
              ]}
            >
              <TextBox variant="title2" color={liked ? '#FFFFFF' : theme.text}>
                {liked ? '❤️' : '🤍'}
              </TextBox>
            </Animated.View>
            <CustomButton
              title={liked ? '좋아요 취소' : '좋아요'}
              onPress={handleLike}
              variant={liked ? 'primary' : 'outline'}
              size="small"
              style={styles.toggleButton}
            />
          </View>
        </View>

        {/* Animated 종류 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 Animated 종류
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Animated.Value()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              단일 값 (opacity, translateX, scale 등)
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Animated.ValueXY()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              2D 좌표 (드래그, pan 제스처에서 사용)
            </TextBox>
          </View>
        </View>

        {/* Animation 종류 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 Animation 종류
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Animated.timing()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              시간 기반 애니메이션 + 이징 함수 (가장 많이 사용)
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Animated.spring()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              물리 기반 spring 애니메이션 (자연스러운 움직임)
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Animated.decay()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              초기 속도로 시작 → 점점 감속하며 멈춤 (스크롤 관성)
            </TextBox>
          </View>
        </View>

        {/* Native Driver */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚡ Native Driver
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • useNativeDriver: true로 설정하면 성능 극대화
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 브릿지 없이 UI Thread에서 애니메이션 실행
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 지원: transform, opacity
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.error}
              style={styles.infoItem}
            >
              • 미지원: height, width, backgroundColor (layout 관련)
            </TextBox>
          </View>
        </View>

        {/* 애니메이션 조합 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 애니메이션 조합
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              sequence
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              순차 실행: Animated.sequence([a1, a2, a3])
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              parallel
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              동시 실행: Animated.parallel([a1, a2])
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              stagger
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              지연 간격: Animated.stagger(200, [a1, a2, a3])
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              loop
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              반복 실행: Animated.loop(animation, {'{'} iterations: -1 {'}'})
            </TextBox>
          </View>
        </View>

        {/* interpolate */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 interpolate (값 변환)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            입력 범위를 출력 범위로 매핑 (가장 많이 사용되는 핵심 기능)
          </TextBox>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`const translateY = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -50],
  extrapolate: 'clamp',
});`}
            </TextBox>
          </View>
        </View>

        {/* Animated.event */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 Animated.event
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크롤/제스처 이벤트를 Animated.Value에 직접 매핑
          </TextBox>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  { useNativeDriver: true }
)}`}
            </TextBox>
          </View>
        </View>

        {/* Animatable Components */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 Animatable Components
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.View
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.Text
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.Image
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.ScrollView
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.FlatList
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.SectionList
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • Animated.createAnimatedComponent(CustomComponent)
            </TextBox>
          </View>
        </View>

        {/* LayoutAnimation 상세 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 LayoutAnimation 상세
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              LayoutAnimation이란?
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              전역 레이아웃 변화를 자동으로 애니메이션 처리
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              사용 시기
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • Flexbox 레이아웃 업데이트 시 유용
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • 리스트 아이템 추가/제거
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • 뷰 크기 변경
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              Presets
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • LayoutAnimation.Presets.easeInEaseOut
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • LayoutAnimation.Presets.spring
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • LayoutAnimation.Presets.linear
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.error}
              style={styles.warningItem}
            >
              ⚠️ Android에서 사용하려면
              UIManager.setLayoutAnimationEnabledExperimental(true) 필요
            </TextBox>
          </View>
        </View>

        {/* Gesture Responder System 상세 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 Gesture Responder System 상세
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              목적
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • 터치 이벤트가 스크롤인지, 탭인지, 슬라이드인지 판단
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • 부모/자식 컴포넌트 간 터치 충돌 협상
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              주요 라이프사이클
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onStartShouldSetResponder: 터치 시작 시 응답자 요청
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onMoveShouldSetResponder: 터치 이동 시 응답자 요청
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onResponderGrant: 응답자 승인, 시각적 피드백 표시
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onResponderMove: 터치 이동 중
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onResponderRelease: 터치 끝
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • onResponderTerminate: 응답자가 강제 변경됨
            </TextBox>
          </View>
        </View>

        {/* PanResponder 상세 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 PanResponder 상세
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              PanResponder란?
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              Gesture Responder System 위에 더 높은 수준의 제스처 처리 제공
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              gestureState 객체
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • moveX, moveY: 최근 좌표
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • x0, y0: 터치 시작 좌표
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • dx, dy: 누적 이동 거리
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • vx, vy: 현재 속도
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • numberActiveTouches: 현재 화면 터치 수
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              사용 시기
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • 드래그, 슬라이드, 카루셀 등 구현
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • Animated API와 연동 가능
            </TextBox>
          </View>
        </View>

        {/* 성능 최적화 팁 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚡ 성능 최적화 팁
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • useNativeDriver: true → UI 스레드에서 실행, 프레임 드랍 방지
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • setNativeProps: 깊은 컴포넌트 트리에서도 최적화 가능
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • InteractionManager: 애니메이션 중 계산 작업 지연
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • requestAnimationFrame: 프레임 단위 업데이트 (직접 호출은 거의
              필요 없음)
            </TextBox>
          </View>
        </View>

        {/* Animated vs LayoutAnimation */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 Animated vs LayoutAnimation
          </TextBox>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.comparisonTitle}
              >
                Animated
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 세밀하고 인터랙티브한 애니메이션 제어
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 선언적 방식으로 입력/출력 값 연결
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • useNativeDriver로 성능 최적화
              </TextBox>
            </View>
            <View style={styles.comparisonItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.comparisonTitle}
              >
                LayoutAnimation
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 전역 레이아웃 변화 자동 애니메이션
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • Flexbox 레이아웃 업데이트 시 유용
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 제어 범위는 Animated보다 제한적
              </TextBox>
            </View>
          </View>
        </View>

        {/* Best Practices */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 Best Practices
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 피드백/하이라이트: 사용자가 터치를 인식하고 있다는 시각적 표시
              필요
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 취소 가능: 터치 도중 손가락을 떼거나 이동 시 동작 취소 가능해야
              함
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • Touchable 컴포넌트 사용: 버튼, 링크 등 단순 터치는
              TouchableHighlight, TouchableOpacity 등 사용 권장
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 세밀/인터랙티브 애니메이션 → Animated
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 레이아웃 변화 자동 애니메이션 → LayoutAnimation
            </TextBox>
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
              • layout 관련 값(height, width, backgroundColor)은 native driver
              불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • transform, opacity만 native driver 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • PanResponder는 useNativeDriver: false 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 애니메이션 완료 후 정리 작업은 start()의 callback에서 처리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • LayoutAnimation은 Android에서 UIManager 설정 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Gesture Responder는 낮은 수준의 API, 대부분 PanResponder나
              Touchable 컴포넌트 사용 권장
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
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  animatedBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  translateContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  dragContainer: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  draggableBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  responderBox: {
    width: 200,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  layoutContainer: {
    gap: 12,
    marginTop: 12,
  },
  layoutItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonContainer: {
    gap: 12,
  },
  comparisonItem: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  comparisonTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  scrollContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollHeader: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollItem: {
    padding: 16,
    borderBottomWidth: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  carouselContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  carouselSlide: {
    width: SCREEN_WIDTH - 80,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartContainer: {
    alignItems: 'center',
    gap: 16,
  },
  heartBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#d4d4d4',
  },
  codeItem: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
