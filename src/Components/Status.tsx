import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ReduxAction from '../Core/Objects/ReduxAction';
import { RNRequest } from '../Core/Objects/RNRequest';
import { setColor } from '../Utils/helpers';
import { EnumSourceType } from '../types';

export interface IProps {
  item: RNRequest | ReduxAction;
  text?: string;
  subText?: string;
  textColor?: Object;
  backgroundColor?: string;
}

export const Status: React.FC<IProps> = (props: IProps) => {
  if (props.item instanceof ReduxAction || props.item.type === EnumSourceType.Redux) {
    return (
      <View style={[styles.leftContainer, { backgroundColor: props.backgroundColor || 'white' }]}>
        <Text testID="statusText" style={[styles.methodText, props.textColor]}>
          {props.text}
        </Text>
        <Text testID="statusSubText" style={[styles.statusText]}>
          {props.subText}
        </Text>
      </View>
    );
  }

  const _color = setColor(props.item.status);
  return (
    <View style={[styles.leftContainer, { backgroundColor: props.backgroundColor || _color }]}>
      <Text testID="statusMethod" style={[styles.methodText, props.textColor]}>
        {props.item.method || props.text}
      </Text>
      <Text testID="statusCode" style={[styles.statusText]}>
        {props.item.status || props.subText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    justifyContent: 'space-around',
    width: 50,
    height: 50,
  },
  methodText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212121',
  },
});
