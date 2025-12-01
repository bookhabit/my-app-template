import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Image,
  Platform,
  Alert,
  Linking,
} from 'react-native';

import * as Contacts from 'expo-contacts';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ContactsScreen() {
  const { theme } = useTheme();

  // Permissions
  const [permission, setPermission] =
    useState<Contacts.ContactsPermissionResponse | null>(null);
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);

  // Contacts state
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] =
    useState<Contacts.Contact | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Groups and containers (iOS)
  const [groups, setGroups] = useState<Contacts.Group[]>([]);
  const [containers, setContainers] = useState<Contacts.Container[]>([]);
  const [defaultContainerId, setDefaultContainerId] = useState<string | null>(
    null
  );

  // Contact form inputs
  const [firstName, setFirstName] = useState('홍');
  const [lastName, setLastName] = useState('길동');
  const [company, setCompany] = useState('회사명');
  const [phoneNumber, setPhoneNumber] = useState('010-1234-5678');
  const [email, setEmail] = useState('hong@example.com');
  const [address, setAddress] = useState('서울시 강남구');
  const [jobTitle, setJobTitle] = useState('개발자');
  const [department, setDepartment] = useState('개발팀');
  const [note, setNote] = useState('메모입니다');

  // ContactAccessButton (iOS 18+)
  const [isContactAccessButtonAvailable, setIsContactAccessButtonAvailable] =
    useState(false);
  const [accessButtonQuery, setAccessButtonQuery] = useState('');

  useEffect(() => {
    checkAvailability();
    checkPermissions();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Contacts.isAvailableAsync();
      setIsAvailable(available);
      setIsContactAccessButtonAvailable(
        Contacts.ContactAccessButton.isAvailable()
      );
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const status = await Contacts.getPermissionsAsync();
      setPermission(status);
      setCanAskAgain(status.canAskAgain);
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const status = await Contacts.requestPermissionsAsync();
      setPermission(status);
      setCanAskAgain(status.canAskAgain);

      if (status.status === 'granted') {
        await loadContacts();
      } else if (status.status === 'denied' && !status.canAskAgain) {
        Alert.alert(
          '권한 필요',
          '연락처 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정 열기',
              onPress: openAppSettings,
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
      setTimeout(() => {
        checkPermissions();
      }, 1000);
    } catch (error) {
      Alert.alert('오류', '앱 설정을 열 수 없습니다.');
    }
  };

  const loadContacts = async () => {
    if (!permission?.granted) {
      Alert.alert('알림', '연락처 권한이 필요합니다.');
      return;
    }

    try {
      const { data, hasNextPage, hasPreviousPage } =
        await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.ID,
            Contacts.Fields.Name,
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.Company,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Addresses,
            Contacts.Fields.JobTitle,
            Contacts.Fields.Department,
            Contacts.Fields.Image,
            Contacts.Fields.ImageAvailable,
            Contacts.Fields.Note,
          ],
          pageSize: 50,
          sort: Contacts.SortTypes.UserDefault,
        });

      setContacts(data);
      Alert.alert('성공', `${data.length}개의 연락처를 불러왔습니다.`);
    } catch (error) {
      Alert.alert('오류', `연락처 로드 실패: ${error}`);
    }
  };

  const loadGroups = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', '그룹 기능은 iOS에서만 사용 가능합니다.');
      return;
    }

    try {
      const groupsList = await Contacts.getGroupsAsync({});
      setGroups(groupsList);
      Alert.alert('성공', `${groupsList.length}개의 그룹을 불러왔습니다.`);
    } catch (error) {
      Alert.alert('오류', `그룹 로드 실패: ${error}`);
    }
  };

  const loadContainers = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', '컨테이너 기능은 iOS에서만 사용 가능합니다.');
      return;
    }

    try {
      const containersList = await Contacts.getContainersAsync({});
      setContainers(containersList);

      const defaultId = await Contacts.getDefaultContainerIdAsync();
      setDefaultContainerId(defaultId);

      Alert.alert(
        '성공',
        `${containersList.length}개의 컨테이너를 불러왔습니다.`
      );
    } catch (error) {
      Alert.alert('오류', `컨테이너 로드 실패: ${error}`);
    }
  };

  const createContact = async () => {
    if (!permission?.granted) {
      Alert.alert('알림', '연락처 권한이 필요합니다.');
      return;
    }

    try {
      const contact: Contacts.Contact = {
        [Contacts.Fields.FirstName]: firstName,
        [Contacts.Fields.LastName]: lastName,
        [Contacts.Fields.Company]: company,
        [Contacts.Fields.PhoneNumbers]: [
          {
            label: 'mobile',
            number: phoneNumber,
            isPrimary: true,
          },
        ],
        [Contacts.Fields.Emails]: [
          {
            label: 'work',
            email: email,
            isPrimary: true,
          },
        ],
        [Contacts.Fields.Addresses]: [
          {
            label: 'home',
            street: address,
            city: '서울시',
            region: '강남구',
            country: '대한민국',
            postalCode: '12345',
          },
        ],
        [Contacts.Fields.JobTitle]: jobTitle,
        [Contacts.Fields.Department]: department,
        [Contacts.Fields.Note]: note,
        contactType: Contacts.ContactTypes.Person,
      };

      const contactId = await Contacts.addContactAsync(contact);
      Alert.alert('성공', `연락처가 생성되었습니다: ${contactId}`);
      await loadContacts();
    } catch (error) {
      Alert.alert('오류', `연락처 생성 실패: ${error}`);
    }
  };

  const updateContact = async (contactId: string) => {
    if (!permission?.granted) {
      Alert.alert('알림', '연락처 권한이 필요합니다.');
      return;
    }

    try {
      const updatedContact = {
        id: contactId,
        [Contacts.Fields.FirstName]: firstName,
        [Contacts.Fields.LastName]: lastName,
        [Contacts.Fields.Company]: company,
        [Contacts.Fields.JobTitle]: jobTitle,
        [Contacts.Fields.Department]: department,
        [Contacts.Fields.Note]: note,
      };

      const resultId = await Contacts.updateContactAsync(updatedContact);
      Alert.alert('성공', `연락처가 수정되었습니다: ${resultId}`);
      await loadContacts();
    } catch (error) {
      Alert.alert('오류', `연락처 수정 실패: ${error}`);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!permission?.granted) {
      Alert.alert('알림', '연락처 권한이 필요합니다.');
      return;
    }

    try {
      await Contacts.removeContactAsync(contactId);
      Alert.alert('성공', '연락처가 삭제되었습니다.');
      await loadContacts();
    } catch (error) {
      Alert.alert('오류', `연락처 삭제 실패: ${error}`);
    }
  };

  const pickContact = async () => {
    try {
      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        setSelectedContact(contact);
        Alert.alert('성공', `연락처 선택됨: ${contact.name}`);
      } else {
        Alert.alert('알림', '연락처 선택이 취소되었습니다.');
      }
    } catch (error) {
      Alert.alert('오류', `연락처 선택 실패: ${error}`);
    }
  };

  const presentForm = async (contactId?: string) => {
    try {
      await Contacts.presentFormAsync(contactId || null, null, {
        allowsEditing: true,
        allowsActions: true,
        isNew: !contactId,
        message: contactId ? '연락처 수정' : '새 연락처',
      });
      await loadContacts();
    } catch (error) {
      Alert.alert('오류', `폼 표시 실패: ${error}`);
    }
  };

  const createGroup = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', '그룹 기능은 iOS에서만 사용 가능합니다.');
      return;
    }

    try {
      const groupId = await Contacts.createGroupAsync('Expo 테스트 그룹');
      Alert.alert('성공', `그룹이 생성되었습니다: ${groupId}`);
      await loadGroups();
    } catch (error) {
      Alert.alert('오류', `그룹 생성 실패: ${error}`);
    }
  };

  const getContactById = async (contactId: string) => {
    try {
      const contact = await Contacts.getContactByIdAsync(contactId, [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Addresses,
        Contacts.Fields.Image,
      ]);

      if (contact) {
        setSelectedContact(contact);
        Alert.alert('성공', `연락처 조회됨: ${contact.name}`);
      } else {
        Alert.alert('알림', '연락처를 찾을 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', `연락처 조회 실패: ${error}`);
    }
  };

  const handleContactAccessButtonPress = (contactId: string) => {
    Alert.alert('연락처 접근', `선택된 연락처 ID: ${contactId}`);
  };

  const presentAccessPicker = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', '이 기능은 iOS 18+에서만 사용 가능합니다.');
      return;
    }

    try {
      const contactIds = await Contacts.presentAccessPickerAsync();
      Alert.alert(
        '성공',
        `${contactIds.length}개의 연락처에 접근 권한이 부여되었습니다.`
      );
      await checkPermissions();
    } catch (error) {
      Alert.alert('오류', `접근 선택 실패: ${error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Contacts" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Contacts
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          시스템 연락처 읽기/쓰기 및 관리
        </TextBox>

        {/* 개념 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📚 개념 설명
          </TextBox>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              Contacts API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 시스템 연락처 읽기/쓰기 기능 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 연락처 생성/수정/삭제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 연락처 선택 (시스템 UI)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 그룹 및 컨테이너 관리 (iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • ContactAccessButton (iOS 18+)
            </TextBox>
          </View>
        </View>

        {/* 상태 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 API 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === true
                    ? theme.success
                    : isAvailable === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {isAvailable === true
                  ? '✅ 사용 가능'
                  : isAvailable === false
                    ? '❌ 사용 불가'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                권한 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  permission?.granted
                    ? theme.success
                    : permission?.status === 'denied'
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {permission?.granted
                  ? '✅ 허용됨'
                  : permission?.status === 'denied'
                    ? '❌ 거부됨'
                    : permission?.status === 'undetermined'
                      ? '확인 필요'
                      : '확인 중...'}
              </TextBox>
            </View>

            {permission && (
              <View style={styles.statusRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  접근 권한:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {permission.accessPrivileges === 'all'
                    ? '전체 접근'
                    : permission.accessPrivileges === 'limited'
                      ? '제한된 접근 (iOS 18+)'
                      : '없음'}
                </TextBox>
              </View>
            )}

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                ContactAccessButton:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isContactAccessButtonAvailable ? theme.success : theme.error
                }
              >
                {isContactAccessButtonAvailable ? '✅ iOS 18+' : '❌ 사용 불가'}
              </TextBox>
            </View>

            <View style={styles.buttonRow}>
              {permission?.status === 'denied' && !canAskAgain ? (
                <CustomButton
                  title="앱 설정 열기"
                  onPress={openAppSettings}
                  style={styles.button}
                />
              ) : !permission?.granted ? (
                <CustomButton
                  title="권한 요청"
                  onPress={requestPermissions}
                  style={styles.button}
                />
              ) : null}

              {permission?.accessPrivileges === 'limited' &&
                Platform.OS === 'ios' && (
                  <CustomButton
                    title="접근 선택 (iOS 18+)"
                    onPress={presentAccessPicker}
                    variant="ghost"
                    style={styles.button}
                  />
                )}
            </View>

            {permission?.status === 'denied' && !canAskAgain && (
              <View
                style={[
                  styles.warningContainer,
                  { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
                ]}
              >
                <TextBox variant="body4" color={theme.warning}>
                  ⚠️ 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.
                </TextBox>
              </View>
            )}
          </View>
        </View>

        {/* 연락처 조회 */}
        {permission?.granted && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📇 연락처 조회
            </TextBox>

            <View style={styles.buttonRow}>
              <CustomButton
                title="연락처 목록 로드"
                onPress={loadContacts}
                style={styles.button}
              />
              <CustomButton
                title="연락처 선택"
                onPress={pickContact}
                variant="ghost"
                style={styles.button}
              />
            </View>

            {contacts.length > 0 && (
              <View style={styles.listContainer}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.listTitle}
                >
                  연락처 목록 ({contacts.length}개)
                </TextBox>
                {contacts.slice(0, 10).map((contact) => (
                  <View
                    key={contact.id}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.contactContent}>
                      {contact.imageAvailable && contact.image && (
                        <Image
                          source={{ uri: contact.image.uri }}
                          style={styles.contactImage}
                        />
                      )}
                      <View style={styles.contactText}>
                        <TextBox variant="body2" color={theme.text}>
                          {contact.name}
                        </TextBox>
                        {contact.company && (
                          <TextBox variant="body4" color={theme.textSecondary}>
                            {contact.company}
                          </TextBox>
                        )}
                        {contact.phoneNumbers &&
                          contact.phoneNumbers.length > 0 && (
                            <TextBox
                              variant="body4"
                              color={theme.textSecondary}
                            >
                              📞 {contact.phoneNumbers[0].number}
                            </TextBox>
                          )}
                        {contact.emails && contact.emails.length > 0 && (
                          <TextBox variant="body4" color={theme.textSecondary}>
                            ✉️ {contact.emails[0].email}
                          </TextBox>
                        )}
                      </View>
                    </View>
                    <View style={styles.contactActions}>
                      <CustomButton
                        title="조회"
                        onPress={() => getContactById(contact.id!)}
                        variant="ghost"
                        style={styles.smallButton}
                      />
                      <CustomButton
                        title="수정"
                        onPress={() => updateContact(contact.id!)}
                        variant="ghost"
                        style={styles.smallButton}
                      />
                      <CustomButton
                        title="삭제"
                        onPress={() => deleteContact(contact.id!)}
                        variant="ghost"
                        style={styles.smallButton}
                      />
                    </View>
                  </View>
                ))}
                {contacts.length > 10 && (
                  <TextBox variant="body4" color={theme.textSecondary}>
                    ... 외 {contacts.length - 10}개
                  </TextBox>
                )}
              </View>
            )}

            {selectedContact && (
              <View style={styles.selectedContactContainer}>
                <TextBox variant="body2" color={theme.text}>
                  선택된 연락처:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {selectedContact.name}
                </TextBox>
                {selectedContact.phoneNumbers && (
                  <TextBox variant="body4" color={theme.textSecondary}>
                    전화:{' '}
                    {selectedContact.phoneNumbers
                      .map((p) => p.number)
                      .join(', ')}
                  </TextBox>
                )}
                {selectedContact.emails && (
                  <TextBox variant="body4" color={theme.textSecondary}>
                    이메일:{' '}
                    {selectedContact.emails.map((e) => e.email).join(', ')}
                  </TextBox>
                )}
              </View>
            )}
          </View>
        )}

        {/* 연락처 생성 */}
        {permission?.granted && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ✨ 연락처 생성
            </TextBox>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  이름
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="이름"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  성
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="성"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  회사
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="회사명"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  전화번호
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="010-1234-5678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  이메일
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  주소
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="주소"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  직책
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="직책"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  부서
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="부서"
                />
              </View>

              <View style={styles.formGroup}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  메모
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="메모"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="연락처 생성"
                onPress={createContact}
                style={styles.button}
              />
              <CustomButton
                title="시스템 폼으로 생성"
                onPress={() => presentForm()}
                variant="ghost"
                style={styles.button}
              />
            </View>
          </View>
        )}

        {/* 그룹 및 컨테이너 (iOS) */}
        {Platform.OS === 'ios' && permission?.granted && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📁 그룹 및 컨테이너 (iOS)
            </TextBox>

            <View style={styles.buttonRow}>
              <CustomButton
                title="그룹 목록 로드"
                onPress={loadGroups}
                style={styles.button}
              />
              <CustomButton
                title="컨테이너 목록 로드"
                onPress={loadContainers}
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="그룹 생성"
                onPress={createGroup}
                variant="ghost"
                style={styles.button}
              />
            </View>

            {defaultContainerId && (
              <View style={styles.infoContainer}>
                <TextBox variant="body3" color={theme.text}>
                  기본 컨테이너 ID: {defaultContainerId}
                </TextBox>
              </View>
            )}

            {groups.length > 0 && (
              <View style={styles.listContainer}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.listTitle}
                >
                  그룹 목록 ({groups.length}개)
                </TextBox>
                {groups.map((group) => (
                  <View
                    key={group.id}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <TextBox variant="body3" color={theme.text}>
                      {group.name || '이름 없음'}
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      ID: {group.id}
                    </TextBox>
                  </View>
                ))}
              </View>
            )}

            {containers.length > 0 && (
              <View style={styles.listContainer}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.listTitle}
                >
                  컨테이너 목록 ({containers.length}개)
                </TextBox>
                {containers.map((container) => (
                  <View
                    key={container.id}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <TextBox variant="body3" color={theme.text}>
                      {container.name}
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      타입: {container.type} | ID: {container.id}
                    </TextBox>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ContactAccessButton (iOS 18+) */}
        {isContactAccessButtonAvailable && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              🔘 ContactAccessButton (iOS 18+)
            </TextBox>

            <View style={styles.formGroup}>
              <TextBox variant="body3" color={theme.textSecondary}>
                검색어:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={accessButtonQuery}
                onChangeText={setAccessButtonQuery}
                placeholder="연락처 검색"
              />
            </View>

            <View style={styles.accessButtonContainer}>
              <Contacts.ContactAccessButton
                style={styles.accessButton}
                query={accessButtonQuery}
                onPress={handleContactAccessButtonPress}
                backgroundColor={theme.primary}
                textColor="white"
                tintColor={theme.primary}
                caption="email"
                acceptedContentTypes={['plain-text']}
                displayMode="iconAndLabel"
                cornerStyle="capsule"
              />
            </View>

            <TextBox variant="body4" color={theme.textSecondary}>
              위 버튼을 사용하여 제한된 권한으로 연락처에 접근할 수 있습니다.
            </TextBox>
          </View>
        )}

        {/* 코드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 코드 예제
          </TextBox>
          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`// 1. 권한 확인 및 요청
import * as Contacts from 'expo-contacts';

const { status, accessPrivileges } = await Contacts.requestPermissionsAsync();
// status: 'granted' | 'denied' | 'undetermined'
// accessPrivileges: 'all' | 'limited' | 'none' (iOS 18+)

// 2. 연락처 조회
const { data, hasNextPage } = await Contacts.getContactsAsync({
  fields: [
    Contacts.Fields.Name,
    Contacts.Fields.PhoneNumbers,
    Contacts.Fields.Emails,
    Contacts.Fields.Addresses,
    Contacts.Fields.Image,
  ],
  pageSize: 50,
  sort: Contacts.SortTypes.UserDefault,
});

// 3. 연락처 생성
const contactId = await Contacts.addContactAsync({
  [Contacts.Fields.FirstName]: '홍',
  [Contacts.Fields.LastName]: '길동',
  [Contacts.Fields.Company]: '회사명',
  [Contacts.Fields.PhoneNumbers]: [
    {
      label: 'mobile',
      number: '010-1234-5678',
      isPrimary: true,
    },
  ],
  [Contacts.Fields.Emails]: [
    {
      label: 'work',
      email: 'hong@example.com',
    },
  ],
  [Contacts.Fields.Addresses]: [
    {
      label: 'home',
      street: '서울시 강남구',
      city: '서울시',
      country: '대한민국',
    },
  ],
  contactType: Contacts.ContactTypes.Person,
});

// 4. 연락처 수정
await Contacts.updateContactAsync({
  id: contactId,
  [Contacts.Fields.FirstName]: '수정된 이름',
  [Contacts.Fields.Company]: '새 회사',
});

// 5. 연락처 삭제
await Contacts.removeContactAsync(contactId);

// 6. 연락처 선택 (시스템 UI)
const contact = await Contacts.presentContactPickerAsync();

// 7. 연락처 폼 표시
await Contacts.presentFormAsync(contactId, null, {
  allowsEditing: true,
  allowsActions: true,
  isNew: false,
});

// 8. 그룹 관리 (iOS)
const groupId = await Contacts.createGroupAsync('그룹명');
await Contacts.addExistingContactToGroupAsync(contactId, groupId);
const groups = await Contacts.getGroupsAsync({});

// 9. 컨테이너 관리 (iOS)
const containers = await Contacts.getContainersAsync({});
const defaultContainerId = await Contacts.getDefaultContainerIdAsync();

// 10. ContactAccessButton (iOS 18+)
import { ContactAccessButton } from 'expo-contacts';

if (ContactAccessButton.isAvailable()) {
  <ContactAccessButton
    style={{ width: 200, height: 44 }}
    query="검색어"
    onPress={(contactId) => {
      console.log('Selected contact:', contactId);
    }}
    backgroundColor="#4630EB"
    textColor="white"
    caption="email"
    acceptedContentTypes={['plain-text']}
  />
}`}
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
              • 연락처 읽기/쓰기 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 그룹 및 컨테이너는 iOS에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • ContactAccessButton은 iOS 18+에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS 18+: 제한된 접근 권한 지원 (limited access)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android Expo Go: WRITE_CONTACTS 권한 없음 (개발 빌드 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Note 필드는 추가 권한 필요 (iOS)
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
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  conceptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 6,
  },
  conceptTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  conceptText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  smallButton: {
    minWidth: 60,
  },
  formContainer: {
    gap: 12,
    marginTop: 12,
  },
  formGroup: {
    gap: 4,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  listContainer: {
    marginTop: 12,
    gap: 8,
  },
  listTitle: {
    marginBottom: 8,
  },
  contactItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactText: {
    flex: 1,
    gap: 4,
  },
  contactActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedContactContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  infoContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  accessButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  accessButton: {
    width: 200,
    height: 44,
  },
  codeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    gap: 8,
  },
  warningItem: {
    marginLeft: 8,
    lineHeight: 22,
  },
});
