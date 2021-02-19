import * as React from 'react';
import { StyleSheet, View, ScrollView, Share, Alert } from 'react-native';
import { Appbar, Subheading, Text, Surface, IconButton } from 'react-native-paper';
import { Status } from './Status';
import { duration, getDate } from '../Utils/helpers';
import { ILog } from '../types';
import RNRequest from '../Core/Objects/RNRequest';
import NRequest from '../Core/Objects/NRequest';
import Clipboard from '@react-native-clipboard/clipboard';
import ReduxAction from '../Core/Objects/ReduxAction';

export interface IProps {
  testId?: string;
  onPressBack: (showDetails: boolean) => void;
  item: ILog;
}

// These attribute will be not added in the detail's scrollview because always displayed in the other components
const excludedAttributes: Array<string> = [
  '_id',
  'type',
  'readyState',
  'method',
  'status',
  'startTime',
  'endTime',
  'dataSent',
  'requestHeaders',
  'responseHeaders',
  'response',
  'responseSize',
  'responseType',
  'responseContentType',
];

const stringifyData = (array: Array<string[]>): string => {
  let _string = '';
  let _result = array
    .filter((item: Array<string>) => !excludedAttributes.includes(item[0]))
    .map((item: Array<string>) => {
      return _string.concat(item[0], ': ', item[1], '\n');
    });
  return _result.join('\n');
};

const formatSharedMessage = (
  general: Array<string[]>,
  requestHeaders: Array<string[]>,
  postData: string,
  responseHeaders: Array<string[]>,
  bodyResponse: string
): string => {
  let _general = stringifyData(general);
  let _requestHeaders = stringifyData(requestHeaders);
  let _responseHeaders = stringifyData(responseHeaders);
  let _report = ''.concat(
    'GENERAL\n',
    _general,
    '\n',
    'REQUEST HEADERS\n',
    _requestHeaders,
    '\n',
    'REQUEST DATA\n',
    postData,
    '\n',
    'RESPONSE HEADERS\n',
    _responseHeaders,
    '\n',
    'RESPONSE BODY\n',
    bodyResponse
  );
  return _report;
};

const onShare = async (
  general: Array<string[]>,
  requestHeaders: Array<string[]>,
  postData: string = '',
  responseHeaders: Array<string[]>,
  bodyResponse: string = ''
): Promise<void> => {
  try {
    await Share.share({
      message: formatSharedMessage(
        general,
        requestHeaders,
        postData,
        responseHeaders,
        bodyResponse
      ),
    });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

const onShareReduxAction = async (type: string, payload: string): Promise<void> => {
  try {
    await Share.share({
      message: `${type}\n${payload}`,
    });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

const copyToClipboard = (text: string): void => {
  if (typeof text === 'string') Clipboard.setString(text);
};

const _renderItems = (listOfItems: Array<[string, any]>) =>
  listOfItems
    .filter((item: Array<string>) => !excludedAttributes.includes(item[0]))
    .map((item: Array<string>, index: number) => (
      <View key={index} style={{ flexDirection: 'row' }}>
        <View style={[styles.attribtuesContainer]}>
          <Text style={styles.attributes}>{item[0]}</Text>
          <Text style={styles.text}>{item[1]}</Text>
        </View>
        {item[0] === 'url' && (
          <IconButton icon="content-copy" onPress={() => copyToClipboard(item[1])} />
        )}
      </View>
    ));

export const Details: React.FC<IProps> = (props) => {
  if (props.item instanceof ReduxAction) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction
            color="white"
            onPress={() => props.onPressBack(false)}
            testID="buttonBackToMainScreen"
          />
          <Appbar.Content title="Netwatch" />
          <IconButton
            color="white"
            icon="share"
            onPress={
              () => {
                onShareReduxAction(
                  props.item.action.type.toUpperCase(),
                  JSON.stringify(props.item.action.payload, null, 2)
                );
              }
              // onShare()
            }
          />
        </Appbar.Header>
        <Surface style={{ flexDirection: 'row' }}>
          {props.item && (
            <Status item={props.item} backgroundColor="#64b5f6" text="ACT" subText="-" />
          )}
          <View style={styles.subHeaderContainer}>
            <Text style={styles.textSubheader}>{props.item.action.type.toUpperCase()}</Text>
            <Text style={styles.textSubheader}>{`${getDate(props.item.startTime)}`}</Text>
          </View>
        </Surface>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollview}>
            <View>
              <Subheading style={styles.subheading}>PAYLOAD</Subheading>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.text}>
                  {JSON.stringify(props.item.action.payload, null, 2)}
                </Text>
                <IconButton
                  icon="content-copy"
                  onPress={() =>
                    copyToClipboard(JSON.stringify(props.item.action.payload, null, 2))
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (!(props.item instanceof RNRequest || props.item instanceof NRequest)) return null;
  // Appbar header is repeated here cause we use the absolute position in the style
  // Put this directly in the index.tsx cause that the Appbar will be added
  const _generalElements = (props.item && Object.entries(props.item)) || [];
  const _requestHeadersElements =
    (props.item?.requestHeaders && Object.entries(props.item.requestHeaders)) || [];
  const _responseHeadersElements =
    (props.item?.responseHeaders && Object.entries(props.item.responseHeaders)) || [];

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          color="white"
          onPress={() => props.onPressBack(false)}
          testID="buttonBackToMainScreen"
        />
        <Appbar.Content title="Netwatch" />
        <IconButton
          color="white"
          icon="share"
          onPress={() =>
            onShare(
              _generalElements,
              _requestHeadersElements,
              props.item?.dataSent,
              _responseHeadersElements,
              props.item?.response
            )
          }
        />
      </Appbar.Header>
      <Surface style={{ flexDirection: 'row' }}>
        {props.item && <Status item={props.item} />}
        <View style={styles.subHeaderContainer}>
          <Text style={styles.textSubheader}>{`${getDate(props.item.startTime)}`}</Text>
          <Text style={styles.textSubheader}>{`Duration ${duration(
            props.item.startTime,
            props.item.endTime
          )}ms`}</Text>
        </View>
      </Surface>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollview}>
          <View>
            <Subheading style={styles.subheading}>GENERAL</Subheading>
            {_generalElements && _renderItems(_generalElements)}
            <Subheading style={styles.subheading}>REQUEST HEADERS</Subheading>
            {_requestHeadersElements && _renderItems(_requestHeadersElements)}

            {props.item?.dataSent !== '' && (
              <>
                <Subheading style={styles.subheading}>REQUEST DATA</Subheading>
                <View style={styles.attribtuesContainer}>
                  <Text style={styles.text}>{props.item?.dataSent}</Text>
                </View>
              </>
            )}

            <Subheading style={styles.subheading}>RESPONSE HEADERS</Subheading>
            {_responseHeadersElements && _renderItems(_responseHeadersElements)}
            {props.item?.response !== '' && (
              <>
                <Subheading style={styles.subheading}>RESPONSE BODY</Subheading>
                <View style={styles.attribtuesContainer}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.text}>{props.item?.response}</Text>
                    <IconButton
                      icon="content-copy"
                      onPress={() => copyToClipboard(props.item?.response)}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#212121',
  },
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: 'white',
  },
  subHeaderContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
    backgroundColor: '#212121',
    width: '100%',
  },
  subheading: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 0,
    marginTop: -1,
    backgroundColor: 'lightgray',
    color: 'black',
  },
  attribtuesContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attributes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  text: {
    flex: 1,
    width: '100%',
    fontSize: 16,
    color: 'black',
  },
  textSubheader: {
    fontSize: 16,
    color: 'white',
  },
  scrollview: {
    paddingBottom: 20,
  },
});
