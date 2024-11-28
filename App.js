import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './AppContext';
import BottomTabNavigator from './BottomTabNavigator';
import PlaylistDetailScreen from './PlaylistDetailScreen'; // Đảm bảo đã nhập đúng
import PlaylistScreen from './PlaylistScreen';
import TatCaBaiHat from './TatCaBaiHat';
import LibraryScreen from './LibraryScreen';
import FollowedArtistsPage from './FollowedArtistsPage';
import AudioListing_SearchResults from './AudioListing_SearchResults';
import ManProfileArtist from './ManProfileArtist';
import Home from './Home';
import AlbumScreen from './AlbumScreen';
import AllChart from './AllChart';
import AllAlbum from './AllAlbum';
import AllSongsScreen from './AllSongsScreen';
import LoginScreen from './LoginScreen';
import PhatNhac from './PhatNhac';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          {/* Các màn hình chính */}
          <Stack.Screen name="Tabs" component={BottomTabNavigator} options={{ headerShown: false }} />
          
          {/* Màn hình chi tiết Playlist */}
          <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
          <Stack.Screen name="AllSong" component={TatCaBaiHat} />
          <Stack.Screen name="LB" component={LibraryScreen} />
          <Stack.Screen name="AT" component={FollowedArtistsPage} />
          <Stack.Screen 
            name="allSong" 
            component={AllSongsScreen} 
            options={{
              headerShown: true,
              title: "All Songs",
              headerBackTitle: "Back", // Tiêu đề nút quay lại
              headerBackTitleVisible: true, // Hiển thị tiêu đề nút quay lại
              headerStyle: { backgroundColor: '#f4511e' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen name="H" component={Home} />
          <Stack.Screen name="Trending Albums" component={AllAlbum} />
          <Stack.Screen name="Charts" component={AllChart} />
          <Stack.Screen name="Album" component={AlbumScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Search" component={AudioListing_SearchResults} options={{ headerShown: false }}/>
          <Stack.Screen name="Artist" component={ManProfileArtist} options={{ headerShown: true }} />

           {/* Màn hình Phát Nhạc */}
          <Stack.Screen 
            name="PN" 
            component={PhatNhac} 
            options={{ 
              headerShown: true, 
              title: "Now Playing", 
              headerStyle: { backgroundColor: '#4A00E0' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }} 
            />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};



export default App;

