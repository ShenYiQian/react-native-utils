import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class TabIcon extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Icon
          color={this.props.selected ? 'rgba(20,150,255,1)' : 'rgba(128,128,128,1)'}
          name={this.props.iconName}
          size={25}
        />
        <Text
          style={[
            styles.title,
            { color: this.props.selected ? 'rgba(20,150,255,1)' : 'rgba(128,128,128,1)'}

          ]}
        >
          {this.props.title}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    fontSize: 14
  }
});
