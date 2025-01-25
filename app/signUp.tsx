import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY } from '@env';

const supabaseUrl = 'https://bjdsrtgezbdaoltvleor.supabase.co';

const supabase = createClient(supabaseUrl, SUPABASE_KEY);

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    //const [postalCode, setPostalCode] = useState(null);

    const handleSignUp = () => {
        // Handle sign up logic here
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Username:', username);

        const { data, error } = supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {
                    //postalCode: postalCode,
                    display_name: username
                }
            }
        });
        if (error) {
            console.log('Error signing up:', error.message);
            return;
        } else if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            setPassword(''); // Clear the password field
        }    
         else {
            console.log('User signed up successfully', data);
            Alert.alert(
                'Success',
                'Welcome to SmartKingston!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Profile')
                    }
                ],
                { cancelable: false }
            );
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SmartKingston</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#d3d3d3"
                value={username}
                onChangeText={setUsername}
            />
                <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#d3d3d3"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#d3d3d3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Sign Up" onPress={handleSignUp} />
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
        borderRadius: 10,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});

export default SignUp;