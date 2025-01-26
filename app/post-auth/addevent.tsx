import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import supabase from './supabaseClient'; 
import moment from 'moment';

const AddEvent = ({ navigation }) => {
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [imageUri, setImageUri] = useState('');

    const handleAddEvent = async () => {
        if (company.trim() === '' || message.trim() === '') {
            Alert.alert('Error', 'Company and message cannot be empty');
            return;
        }

        let imageUrl = null;
        if (imageUri) {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const { data, error } = await supabase.storage
                .from('events')
                .upload(`public/${new Date().getTime()}.jpg`, blob, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.log('Error uploading image:', error.message);
                Alert.alert('Error', 'Failed to upload image');
                return;
            }

            imageUrl = data.Key;
        }

        const { data, error } = await supabase
            .from('events')
            .insert([
                { company, message, date_posted: date.toISOString(), image_url: imageUrl }
            ]);

        if (error) {
            console.log('Error adding event:', error.message);
            Alert.alert('Error', 'Failed to add event');
        } else {
            Alert.alert('Success', 'Event added successfully');
            navigation.navigate('Events');
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const handleImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.uri);
        }
    };

    const calculateTimeDifference = () => {
        const now = moment();
        const eventDate = moment(date);
        const duration = moment.duration(eventDate.diff(now));
        const days = duration.asDays().toFixed(0);
        return `${days} days away`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Company</Text>
            <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Enter the host's name"
            />
            <Text style={styles.label}>Message</Text>
            <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter message"
                multiline
            />
            <Text style={styles.label}>Date and Time</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{moment(date).format('MMMM Do YYYY, h:mm a')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            <Text style={styles.timeDifference}>{calculateTimeDifference()}</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
                <Text style={styles.imagePickerButtonText}>Attach Image</Text>
            </TouchableOpacity>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
            <Button title="Add Event" onPress={handleAddEvent} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#2E294E',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#EFBCD5',
    },
    input: {
        height: 40,
        borderColor: '#BE97C6',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        color: '#EFBCD5',
    },
    dateText: {
        fontSize: 16,
        color: '#EFBCD5',
        marginBottom: 16,
        borderColor: '#BE97C6',
    },
    timeDifference: {
        fontSize: 16,
        color: '#EFBCD5',
        marginBottom: 16,
    },
    imagePickerButton: {
        backgroundColor: '#8661C1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
        alignItems: 'center',
    },
    imagePickerButtonText: {
        color: '#EFBCD5',
        fontSize: 16,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#BE97C6',
    },
});

export default AddEvent;