import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from './supabaseClient'; // Import the configured Supabase client

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

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>SmartKingston</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEvent', { sessionToken })}>
                    <Text style={styles.addButtonText}>Add Event</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.event}>
                            <Text style={styles.company}>Company: {item.company}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.datePosted}>Date Posted: {new Date(item.date_posted).toLocaleString()}</Text>
                        </View>
                    )}
                />
            </View>
            <View style={styles.footer}>
                <View style={styles.nav}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.navText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('IsThisRecyclable')}>
                        <Text style={styles.navText}>IsThisRecyclable</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#841584',
        padding: 10,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    event: {
        padding: 10,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    company: {
        fontWeight: 'bold',
    },
    message: {
        marginTop: 5,
    },
    datePosted: {
        marginTop: 5,
        fontSize: 12,
        color: '#888',
    },
    footer: {
        padding: 10,
        backgroundColor: '#f8f8f8',
        textAlign: 'center',
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navText: {
        fontSize: 16,
        color: '#841584',
    },
});

export default Events;