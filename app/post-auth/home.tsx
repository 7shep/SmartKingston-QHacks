import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Button, TextInput, FlatList, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from './supabaseClient'; // Import the configured Supabase client
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Device from 'expo-device';

type Message = {
    content: string;
    created_at: string;
    user_id: string;
    username: string;
};

const Home = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { sessionToken } = route.params || {};

    // For adding a post to the wall
    const [showDropDown, setShowDropdown] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    // For handling notifications
    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log(notification);
        });
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // To ensure Supabase Auth is active
    useEffect(() => {
        // Check if the session is valid and fetch messages
        const checkSessionAndFetchMessages = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                console.log('Error getting session:', error?.message || 'No active session');
                Alert.alert('Error', 'You need to be logged in to view this page.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('SignIn')
                    }
                ]);
            } else {
                console.log('Session is valid:', session);
                fetchMessages();
            }
        };

        checkSessionAndFetchMessages();
    }, [sessionToken]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('content, created_at, user_id, username')
            .order('created_at', { ascending: false });

        if (error) {
            console.log('Error fetching messages:', error.message);
        } else {
            setMessages(data as Message[]);
        }
    };

    const handleNewPost = () => {
        setShowDropdown(!showDropDown);
    };

    const handleSendMessage = async () => {
        if (message.trim() === '') {
            Alert.alert('Error', 'Message cannot be empty');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('messages')
            .insert([
                { user_id: user.id, username: user.user_metadata.display_name, content: message }
            ]);
        if (error) {
            console.log('Error sending message:', error.message);
        } else {
            console.log('Message sent:', message);
            setMessage('');
            setShowDropdown(false);
            fetchMessages();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SmartKingston</Text>
            </View>
            <TouchableOpacity style={styles.newPost} onPress={handleNewPost}>
                <Text style={styles.newPostText}>New Post</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            {showDropDown && (
                <View style={styles.dropdown}>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type your message here"
                        placeholderTextColor={'#d3d3d3'}
                        multiline
                    />
                    <Button title="Send" onPress={handleSendMessage} />
                </View>
            )}
            <View style={styles.flatListContainer}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.created_at}
                    renderItem={({ item }) => (
                        <View style={styles.message}>
                            <Text style={styles.username}>Posted by: {item.username}</Text>
                            <View style={styles.messageContentContainer}>
                                <Text style={styles.content}>{item.content}</Text>
                            </View>
                            <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            </View>
            <View style={styles.separator} />
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('IsThisRecyclable')}>
                    <Text style={styles.navText}>IsThisRecyclable</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Events')}>
                    <Text style={styles.navText}>Upcoming Events</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.navText}>Profile Editor</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 8,
        left: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    navBar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    navButton: {
        margin: 5,
        padding: 10,
        backgroundColor: '#841584',
        borderRadius: 5,
    },
    navText: {
        color: '#fff',
        fontSize: 16,
    },
    newPost: {
        position: 'absolute',
        top: 8,
        right: 16,
        backgroundColor: '#841584',
        padding: 10,
        borderRadius: 5,
    },
    newPostText: {
        color: '#fff',
    },
    dropdown: {
        position: 'absolute',
        top: 50,
        right: 16,
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 5,
        width: '50%',
        zIndex: 1,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    flatListContainer: {
        position: 'absolute',
        top: '10%',
        left: 0,
        width: '100%', // Adjust the width as needed
    },
    message: {
        padding: 10,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    messageContentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontWeight: 'bold',
    },
    content: {
        alignSelf: 'flex-start',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-start',
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
});

export default Home;