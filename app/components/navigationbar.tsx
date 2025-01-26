// NavigationBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const NavigationBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={24} color="#EFBCD5" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person" size={24} color="#EFBCD5" />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Events')}>
        <Ionicons name="calendar" size={24} color="#EFBCD5" />
        <Text style={styles.navText}>Events</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 15,
    backgroundColor: '#4B5267',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    margin: 5,
    padding: 10,
    alignItems: 'center',
  },
  navText: {
    color: '#EFBCD5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NavigationBar;