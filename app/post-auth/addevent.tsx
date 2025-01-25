import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import supabase from './supabaseClient'; // Import the configured Supabase client

const AddEvent = ({ navigation }) => {
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    const [imageUri, setImageUri] = useState('');

    const handleAddEvent = async () => {
        if (company.trim() === '' || message.trim() === '') {
            Alert.alert('Error', 'Company and message cannot be empty');
            return;
        }

        const { data, error } = await supabase
            .from('events')
            .insert([
                { company, message, image_url: imageUri }
            ]);

        if (error) {
            console.log('Error adding event:', error.message);
            Alert.alert('Error', 'Failed to add event');
        } else {
            console.log('Event added:', data);
            Alert.alert('Success', 'Event added successfully');
            navigation.navigate('Events');
        }
    };

    const handleSelectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setImageUri(selectedImage.uri);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Company</Text>
            <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Enter company name"
            />
            <Text style={styles.label}>Message</Text>
            <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter event message"
                multiline
            />
            <Button title="Select Image" onPress={handleSelectImage} />
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
            ) : null}
            <Button title="Add Event" onPress={handleAddEvent} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 16,
    },
});

export default AddEvent;