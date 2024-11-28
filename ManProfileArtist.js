
  import React, {useRef, useState, useEffect } from 'react';
  import { useFocusEffect } from '@react-navigation/native';
  import { ScrollView, FlatList, TextInput, TouchableOpacity, SafeAreaView, View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
  import { FontAwesome } from '@expo/vector-icons';
  import { LinearGradient } from 'expo-linear-gradient'; // Nếu bạn dùng Expo
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

  export default function ManProfileArtist({ route, navigation  }) {
    const { item } = route.params; // Dữ liệu nghệ sĩ được truyền vào từ route.params
    const [songs, setSongs] = useState([]); // Dữ liệu bài hát
    const [trends, setTrends] = useState([]); // Dữ liệu album
    const [artist, setArtist] = useState([]);
    const [currentTime, setCurrentTime] = useState('');
    const [showFullInfo, setShowFullInfo] = useState(false);

     const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [artists, setArtists] = useState([]);
  const {followedArtists, setFollowedArtists} = useAppContext();

  // Lấy danh sách bài hát và nghệ sĩ từ API
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

const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };
    const toggleShowFullInfo = () => {
      setShowFullInfo(!showFullInfo);
    };

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
  
    useEffect(() => {
    fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song')
      .then((response) => response.json())
      .then((data) => {
        if (data[0]) {
          const filteredSongs = data[0].songs?.filter((song) => song.caSi === item.name) || [];
          const filteredAlbums = data[0].trends?.filter((album) => album.caSi === item.name) || [];
          const filteredArtists = data[0].artist?.filter((artist) => artist.caSi === item.name) || [];
          
          setSongs(filteredSongs);
          setTrends(filteredAlbums);
          setArtist(filteredArtists);
        }
      })
      .catch((error) => console.error('Lỗi khi lấy dữ liệu từ API:', error));
  }, [item.name]);

    // Hàm để render mỗi bài hát
    const renderSongItem = ({ item }) => (
      <TouchableOpacity>
        <View style={styles.songItem}>
          <Image source={{ uri: item.anh }} style={styles.songImg} />
          <View style={styles.songDetails}>
            <Text style={styles.songTitle}>{item.tenBaiHat}</Text>
            <Text>{item.caSi}</Text>
            <View style={styles.row4}>
              <FontAwesome name="play" size={10} color="gray" />
              <Text style={styles.text1}>{item.luotNghe}</Text>
              <FontAwesome style={styles.text1} name="circle" size={5} color="black" />
              <Text style={styles.text1}>{item.thoiGian}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
            >
              <FontAwesome name="heart" size={24} color={item.isFavorite ? 'red' : 'gray'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openPlaylistModal(item)} style={{
              marginRight:10,
              marginLeft:10,
            }}>
              <MaterialIcons name="playlist-add" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
    const renderAlbum = ({ item }) => (
      <TouchableOpacity>
        <View style={styles.albumItem}>
              <Image source={{ uri: item.anh }} style={styles.albumImg} />
              <View style={{
                marginLeft:10,
                marginTop:10,
              }}>
                    <Text style={styles.tenAlbum}>{item.tenAlbum}</Text>
                    <Text style={styles.tenCaSiAlbum}>Album: {item.caSi}</Text>
              </View>
          </View>
      </TouchableOpacity>
    );
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.row1}>
          <Text style={styles.timeText}>{currentTime}</Text>
      </View>
        <ScrollView>
            <TouchableOpacity style={styles.row8} onPress={() => navigation.navigate('Search')}>
                <FontAwesome name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.banner}>
                <Image source={{ uri: item.anh }} style={styles.artImg} />
                <View style={styles.chuaThongTin}>
                    <Text style={styles.nameartist}>{item.name}</Text>
                    <Text style={styles.fl}>{item.follow}</Text>
                    <View style={styles.viewChuaBut}>
                        <TouchableOpacity style={styles.but}>Follow</TouchableOpacity>
                        <TouchableOpacity style={styles.but}>Phát Nhạc</TouchableOpacity>
                    </View>
                </View>
                <LinearGradient
                    colors={['rgba(128, 128, 128, 0)', 'rgba(128, 128, 128, 0.8)']}
                    style={styles.gradientOverlay}
                ></LinearGradient>
            </View>

            {/* Danh sách các bài hát của nghệ sĩ */}
            <View style={styles.songsContainer}>
              <Text style={styles.text2}>Danh sách bài hát</Text>
              
              <FlatList data={songs} renderItem={renderSongItem} keyExtractor={(item) => item.id.toString()} />
              <AddToPlaylistModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedSong={selectedSong}
              />

            </View>
            <View style={styles.songsContainer}>
              <Text style={styles.text2}>Album</Text>
              <FlatList
                data={trends}
                renderItem={renderAlbum}
                keyExtractor={(item) => item.id?.toString() || item.name.toString()} // Dùng id hoặc name để đảm bảo tính duy nhất
              />
            </View>

            <Text style={styles.text2}>Thông tin</Text>
            <View style={styles.thongTin}>
              <Text style={styles.artistInfo}>
                {showFullInfo
                  ? item.thongTin
                  : item.thongTin.split('\n').slice(0, 3).join('\n')}
              </Text>
              {item.thongTin.split('\n').length > 3 && (
                <TouchableOpacity onPress={toggleShowFullInfo}>
                  <Text style={styles.viewMoreText}>
                    <Text style={{ textDecorationLine: 'underline' }}>
                      {showFullInfo ? 'Ẩn bớt' : 'Xem thêm'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View>
              <Text style={styles.textThongTinCaSi}>Tên thật: <Text style={{
                fontWeight:'bold',
              }}>{item.tenThat}</Text></Text>
              <Text style={styles.textThongTinCaSi}>Ngày sinh: <Text style={{
                fontWeight:'bold',
              }}>{item.ngaySinh}</Text></Text>
              <Text style={styles.textThongTinCaSi}>Quốc gia: <Text style={{
                fontWeight:'bold',
              }}>{item.quocGia}</Text></Text>
              <Text style={styles.textThongTinCaSi}>Thể loại: <Text style={{
                fontWeight:'bold',
              }}>{item.theLoai}</Text></Text>
            </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 5,
  },
songItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  songImg: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  songDetails: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

    artistInfo: {
      fontSize: 14,
    },
    viewMoreText: {
      fontSize: 14,
      marginTop: 5,
    },
    textThongTinCaSi:{
      padding:15,
    },
    thongTin:{
      padding:15,
    },
    text2:{
      fontWeight:'bold',
      fontSize:17,
      padding:10,
    },
    viewChuaBut:{
      justifyContent:'space-between',
      flexDirection:'row',
      top:75,
    },
    gradientOverlay: {
      position: 'absolute',
      bottom: 0, // Đặt gradient phủ lên phần dưới của thông tin
      left: 0,
      right: 0,
      height: '50%', // Mờ phần dưới của thông tin
    },
    but:{
      marginLeft:30,
      justifyContent:'center',
      alignContent:'center',
      alignItems:'center',
      color:'white',
      backgroundColor:'gray',
      padding:4,
      borderRadius:20,
      borderColor:'white',
      borderWidth:1,
      width:120,
    },
    row1: {
      position: 'absolute',
      marginTop:10,
      left: 10,
    },
      timeText: {
      fontSize: 15,
      color: 'white',
    },
    row8:{
      marginLeft:10,
      flexDirection:'row',
      position:'absolute',
      top:45,
      color:'white',
    },
    container: {
      flex: 1,
      backgroundColor: '#ecf0f1',
    },
    banner:{
      width:335,
      height:270,
      position: 'relative',
    },
    artImg: {
      width: "100%",
      height: 270,
      position: 'relative',
    },
    nameartist:{
      position:"absolute",
      fontWeight:'bold',
      left:30,
      top:5,
      color:'white',
      fontSize:23,
    },
    fl:{
      position:"absolute",
      color:'white',
      top:40,
      left:30,
    },
    chuaThongTin: {
      width:'100%',
      height:100,
      position: 'absolute',
      top: 150,
      alignItems: 'flex-start',
      zIndex: 2,
    },
    albumItem: {
      width: 320,
      height: 70 ,
      marginRight: 15,
      flexDirection:'row',
    },
    tenAlbum:{
      fontWeight:'bold',
      fontSize:16,
    },
    albumImg: {
      width: 50,
      height:50,
      marginLeft:10,
      marginTop:10,
    },
    tenCaSiAlbum:{
      
    }
  });
