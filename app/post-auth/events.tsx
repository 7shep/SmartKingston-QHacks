import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from './supabaseClient'; 
import moment from 'moment';

const Events = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { sessionToken } = route.params || {};
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date_posted', { ascending: false });

            if (error) {
                console.log('Error fetching events:', error.message);
            } else {
                setEvents(data);
            }
        };

        fetchEvents();
    }, []);

    const handleAddEvent = () => {
        navigation.navigate('AddEvent');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Upcoming Events</Text>
            </View>
            <TouchableOpacity style={styles.addEventButton} onPress={handleAddEvent}>
                <Text style={styles.addEventButtonText}>Add Event</Text>
            </TouchableOpacity>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.event}>
                        {item.image_url && (
                            <Image source={{ uri: item.image_url }} style={styles.eventImage} />
                        )}
                        <Text style={styles.company}>{item.company}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.date}>{moment(item.date_posted).format('MMMM Do YYYY, h:mm a')}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#2E294E',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EFBCD5',
        textAlign: 'center',
    },
    addEventButton: {
        backgroundColor: '#8661C1',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
        alignItems: 'center',
    },
    addEventButtonText: {
        color: '#EFBCD5',
        fontSize: 18,
        fontWeight: 'bold',
    },
    event: {
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#BE97C6',
        borderRadius: 5,
        backgroundColor: '#4B5267',
    },
    eventImage: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        marginBottom: 10,
    },
    company: {
        fontWeight: 'bold',
        color: '#EFBCD5',
        marginBottom: 5,
    },
    message: {
        color: '#BE97C6',
        marginBottom: 5,
    },
    date: {
        color: '#BE97C6',
        fontSize: 12,
    },
});

export default Events;