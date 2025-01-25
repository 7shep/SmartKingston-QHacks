import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from './post-auth/supabaseClient';
import * as Notifications from 'expo-notifications';


//Notification Handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const SignIn = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');



    const handleSignIn = async () => {
        // Handle sign in logic here
        console.log('Email:', email);
        console.log('Password:', password);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password,
        });

        if (error) {
            console.log('Error signing in:', error.message);
            Alert.alert('Error', 'Invalid email or password');
            return;
        } else {
            console.log('User signed in successfully');
            await sendPushNotification();
            navigation.navigate('Home');   
        }
    };

    const sendPushNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Welcome to SmartKingston!',
                body: 'You are now signed in.',
            },
            trigger: null,
        });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In To SmartKingston</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#d3d3d3"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#d3d3d3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <Button title="Sign In" onPress={handleSignIn} color="#841584" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    buttonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
});

export default SignIn;