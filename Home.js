import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, FlatList, TextInput, TouchableOpacity, SafeAreaView, View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

export default function Home({navigation}) {
  const [currentTime, setCurrentTime] = useState('');
  const [song, setSong] = useState([]);
  const [chart, setChart] = useState([]);
  const [trend, setTrend] = useState([]);
  const [artist, setArtist] = useState([]);
  const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [artists, setArtists] = useState([]);
  const {followedArtists, setFollowedArtists} = useAppContext();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const updatedSongs = data[0].songs.map((song) => ({
          ...song,
          isFavorite: library.some((item) => item.id === song.id),
        }));
        setSongs(updatedSongs);

        const updatedArtists = data[0].artists.map((artist) => ({
          ...artist,
          isFollowed: followedArtists.some((item) => item.id === artist.id),
        }));
        setArtists(updatedArtists);
      }
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    }
  };

  fetchData();
  }, [library, followedArtists]); // Đảm bảo cập nhật khi context thay đổi

    const toggleFollowArtist = async (artist) => {
      const isFollowed = followedArtists.some((s) => s.id === artist.id);
      let updatedFollowedArtists;
      
      if (isFollowed) {
        updatedFollowedArtists = followedArtists.filter((s) => s.id !== artist.id);
      } else {
        updatedFollowedArtists = [...followedArtists, artist];
      }

      setFollowedArtists(updatedFollowedArtists);
      
      // Lưu vào AsyncStorage
      try {
        await AsyncStorage.setItem('followedArtists', JSON.stringify(updatedFollowedArtists));
      } catch (error) {
        console.error('Lỗi khi lưu nghệ sĩ theo dõi:', error);
      }
    };

  
  const toggleFavorite = async (song) => {
  const isFavorite = library.some((s) => s.id === song.id);
  let updatedLibrary;
  let updatedSongs;

  if (isFavorite) {
    updatedLibrary = library.filter((s) => s.id !== song.id);
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: false } : s
    );
  } else {
    updatedLibrary = [...library, song];
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: true } : s
    );
  }

  setLibrary(updatedLibrary);
  setSongs(updatedSongs);

  // Lưu vào AsyncStorage
  try {
    await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error('Lỗi khi lưu bài hát yêu thích:', error);
  }
};


  useEffect(() => {
  fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song')
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSong(data[0].songs);
        setChart(data[0].charts);
        setTrend(data[0].trends);
        setArtist(data[0].artists);
      }
    })
    .catch((error) => console.error(error));
}, []);

const renderSong = ({ item }) => (
  <TouchableOpacity onPress={() => navigation.navigate('PN', item)}>
    <View style={styles.songItem}>
      <Image source={{ uri: item.anh }} style={styles.songImg} />
      <View style={styles.moSong}>
        <Text style={styles.songTitle}>{item.tenBaiHat}</Text>
        <Text style={styles.artistName}>{item.caSi}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
          >
            <FontAwesome name="heart" size={24} color={item.isFavorite ? 'red' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPlaylistModal(item)} style={{
            marginRight: 10,
            marginLeft: 10,
          }}>
            <MaterialIcons name="playlist-add" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);


  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };
  
  const renderChart = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('allSong', { chart: item, songs: songs })}
    >
      <View style={styles.chartItem}>
        <Image source={{ uri: item.anh }} style={styles.chartImg} />
        <View style={styles.moChart}>
          <Text style={styles.chartTop}>{item.top}</Text>
          <Text style={styles.chartTuaDe}>{item.tuaDe}</Text>
        </View>
        <Text style={styles.chartGhichu}>{item.ghiChu}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTrend = ({ item }) => (
  <TouchableOpacity
    onPress={() => {
      // Kiểm tra nếu item hoặc songs là hợp lệ
      if (!item || !songs || songs.length === 0) {
        console.log("Dữ liệu không hợp lệ hoặc không có bài hát.");
        return;
      }

      const normalizeString = (str) => str?.toLowerCase().trim() || '';

      // Lọc các bài hát theo ca sĩ
      const relatedSongs = songs.filter(song => normalizeString(song.caSi) === normalizeString(item.caSi));

      // Điều hướng tới màn hình Album với các bài hát liên quan
      navigation.navigate('Album', { album: item, songs: relatedSongs });
    }}
  >
    <View style={styles.trendItem}>
      <Image source={{ uri: item.anh }} style={styles.chartImg} />
      <Text style={styles.chartGhichu}>{item.tenAlbum}</Text>
      <Text style={styles.chartGhichu}>{item.caSi}</Text>
    </View>
  </TouchableOpacity>
);


  const renderArtist = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Artist', { item })}>
      <View style={styles.artItem}>
        <Image source={{ uri: item.anh }} style={styles.artImg} />
        <Text style={styles.chartGhichu}>{item.name}</Text>
        <TouchableOpacity 
        style={styles.followButton}
        onPress={() => toggleFollowArtist(item)} // Hàm này sẽ thay thế thao tác follow/unfollow
      >
        <Text style={styles.followText}>
          {followedArtists.some((s) => s.id === item.id) ? 'Unfollow' : 'Follow'}
        </Text>
      </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(formattedTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row1}>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>
      <ScrollView
      >
          <View style={styles.row2}>
            <View style={styles.leftContainer}>
              <Image style={{
                marginLeft:10,
                width:30,
                height:30,
              }} source={{ uri: 'https://imgur.com/zOFznc2.jpg' }}  />
            </View>
            <View style={styles.rightContainer}>
              <TouchableOpacity>
                <FontAwesome style={{ marginRight: 10 }} name="bell" size={24} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image style={{
                marginRight:10,
                width:30,
                height:30,
              }} source={{ uri: 'https://imgur.com/agqazKf.jpg' }}  />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.tex1}>Good morning,</Text>
          <Text style={styles.tex2}>Thanh Quyền</Text>
          <Text style={styles.tex3}>Suggestions for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{marginTop:15}}>
              <FlatList
                data={songs}
                renderItem={renderSong}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
          />
          <AddToPlaylistModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedSong={selectedSong}
          />

          </ScrollView>
          <View style={styles.row5}>
              <Text style={styles.tex4}>Charts</Text>
              <TouchableOpacity style={styles.tex5} onPress={() => navigation.navigate('Charts')}>See all</TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{marginTop:15}}>
              <FlatList
                data={chart}
                renderItem={renderChart}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
          />
          </ScrollView>
          <View style={styles.row5}>
              <Text style={styles.tex4}>Trending albums</Text>
              <TouchableOpacity style={styles.tex5}  onPress={() => navigation.navigate('Trending Albums')}>See all</TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginTop: 15 }}>
            <FlatList
              data={trend}
              renderItem={renderTrend}
              keyExtractor={(item) => item.id.toString()}
              horizontal
            />
          </ScrollView>
          <View style={styles.row5}>
              <Text style={styles.tex4}>Popular artists</Text>
              <TouchableOpacity style={styles.tex5}>See all</TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{marginTop:15}}>
              <FlatList
                data={artist}
                renderItem={renderArtist}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
          />
          </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  followButton:{
    marginTop:5,
    padding:7,
    borderWidth:1,
    borderRadius:20,
  },
  actions:{
    marginTop:5,
    flexDirection:'row',
  },
  row6:{
    height:50,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
  },
  butfoot:{
    padding:20,
    justifyContent:'center',
    alignItems:'center',
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },
  row5: {
    padding:10,
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  tex4:{
    fontWeight: 'bold',
    fontSize: 17,
  },
  tex5:{
    fontWeight: 'bold',
    color:'gray',
    fontSize: 15,
  },
  songItem: {
    width: 210,
    height: 250 ,
    marginRight: 15,
    position: 'relative',
    backgroundColor:'red',
  },
  songImg: {
    width: 210,
    height:250,
    backgroundColor: 'purple',
  },
  chartItem: {
    width: 120,
    height: 140 ,
    marginRight: 15,
    position: 'relative',
  },
  artItem: {
    justifyContent:"center",
    alignItems:'center',
    width: 140,
    height: 200 ,
    marginRight: 15,
    position: 'relative',
  },
  artImg: {
    width: 140,
    height:140,
  },
  trendItem: {
    width: 120,
    height: 140 ,
    marginRight: 15,
    position: 'relative',
  },
  chartImg: {
    width: 120,
    height:100,
    backgroundColor: 'purple',
  },
  moSong: {
    paddingLeft:15,
    paddingTop:8,
    position: 'absolute',
    marginTop:175,
    height:100,
    width:"100%",
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  moChart: {
    position:'absolute',
    bottom:50,
    justifyContent:"center",
    alignItems:'center',
    marginLeft:35,
    marginBottom:20,

  },
  songTitle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistName: {
    color: 'black',
    fontSize: 12,
  },
  chartTop: {
    marginBottom:5,
    color: 'Black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartTuaDe: {
    color: 'Black',
    fontSize: 12,
  },
  tex1: {
    marginTop: 15,
    color: 'gray',
  },
  chartGhichu:{
    color:"gray"
  },
  tex2: {
    margin: 20,
    fontWeight: 'bold',
    fontSize: 20,
  },
  tex3: {
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 17,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row1: {
    marginTop:10,
    left: 10,
    zIndex: 1,
  },
  timeText: {
    fontSize: 15,
    color: 'black',
  },
  row2: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  row3: {
    marginTop: 15,
    left: 18,
    flexDirection: 'row',
    width: 300,
    borderWidth: 1,
    borderRadius: 20,
    padding: 5,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  searchInput: {
    width: 250,
    height: 30,
    padding: 5,
    borderColor: 'white',
  },
});
