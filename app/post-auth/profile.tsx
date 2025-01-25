import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import supabase from './supabaseClient'

const Profile = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        // Get the email and username of the current user from Supabase
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.log('Error getting user:', error.message);
                Alert.alert(
                    'Error', 
                    'You need to be logged in.', 
                    [
                        {
                            text: 'OK',
                        }
                    ],
                    { cancelable: false }
                );
                navigation.navigate('SignIn');
            } else {
                setEmail(user.email);
                setUsername(user.user_metadata.display_name);
                setName(user.user_metadata.name || '');
                setBio(user.user_metadata.bio || '');
            }
        };
        fetchUserProfile();
    }, []);

    const handleSave = async () => {
        // Handle save logic here
        const { error } = await supabase.auth.updateUser({
            data: { 
                name: name,
                bio: bio,
            },
        });
        if (error) {
            console.log('Error updating profile:', error.message);
        } else {
            console.log('Profile saved:', { name, bio });
            navigation.navigate('Home');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
            />
            <Text style={styles.label}>Username</Text>
            <TextInput
                style={[styles.input, styles.nonEditableInput]}
                value={username}
                placeholder={username}
                placeholderTextColor={'#ffffff'}
                editable={false}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={[styles.input, styles.nonEditableInput]}
                value={email}
                placeholder={email}
                placeholderTextColor={'#ffffff'}
                editable={false}
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Enter your bio"
                multiline
            />
            <Button title="Save" onPress={handleSave} />
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
    nonEditableInput: {
        backgroundColor: '#333', // Dark grey background color
    },
});

export default Profile;