import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AllSong from './TatCaBaiHat';
import Playlist from './PlaylistScreen';
import Library from './LibraryScreen';
import Artist from './FollowedArtistsPage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AudioListing_SearchResults from './AudioListing_SearchResults';
import Home from './Home';
import FeedScreen from "./FeedScreen";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home" // Đặt màn hình mặc định là "Search"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = 'house';
                    }else if (route.name === 'Feed') {
                        iconName = 'book';
                    } else if (route.name === 'PL') {
                        iconName = 'queue-music';
                    } else if (route.name === 'LB') {
                        iconName = 'library-books';
                    }else if (route.name === 'Search') {
                        iconName = 'search';
                    }
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                headerShown: false, // Ẩn thanh header/banner trên đầu
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Search" component={AudioListing_SearchResults} />
            <Tab.Screen name="Feed" component={FeedScreen} />
            <Tab.Screen name="LB" component={Library} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
