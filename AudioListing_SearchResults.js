import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, TouchableOpacity, SafeAreaView, View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

export default function AudioListing_SearchResults({ navigation }) {
  const [currentTime, setCurrentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [charts, setCharts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [artists, setArtists] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [noResults, setNoResults] = useState(false);

  const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const {followedArtists, setFollowedArtists} = useAppContext();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song');
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Cập nhật songs, artists, charts, trends từ API
        const updatedSongs = data[0].songs.map((song) => ({
          ...song,
          isFavorite: library.some((item) => item.id === song.id), // Kiểm tra trạng thái yêu thích từ thư viện
        }));

        const updatedArtists = data[0].artists.map((artist) => ({
          ...artist,
          isFollowed: followedArtists.some((item) => item.id === artist.id), // Kiểm tra trạng thái theo dõi từ thư viện
        }));

        setSongs(updatedSongs);
        setCharts(data[0].charts);
        setTrends(data[0].trends);
        setArtists(updatedArtists);
      }
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    }
  };

  fetchData();
}, [library, followedArtists]); // Dữ liệu sẽ được cập nhật khi thư viện hoặc danh sách theo dõi thay đổi


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

    if (isFavorite) {
      updatedLibrary = library.filter((s) => s.id !== song.id);
    } else {
      updatedLibrary = [...library, song];
    }

    setLibrary(updatedLibrary);
    
    // Lưu vào AsyncStorage
    try {
      await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary));
    } catch (error) {
      console.error('Lỗi khi lưu bài hát yêu thích:', error);
    }
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

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (searchQuery === '') {
      setFilteredResults([]); // Nếu không có từ khóa tìm kiếm, không hiển thị gì
    } else {
      // Chuyển đổi từ khóa tìm kiếm sang không dấu
      const normalizedSearchQuery = removeVietnameseTones(searchQuery.toLowerCase());

      // Lọc kết quả
      const allResults = [
        ...songs.filter(song => {
          const songTitle = song.tenBaiHat ? removeVietnameseTones(song.tenBaiHat.toLowerCase()) : ''; 
          const songCaSi = song.caSi ? removeVietnameseTones(song.caSi.toLowerCase()) : '';
          return songTitle.includes(normalizedSearchQuery) || songCaSi.includes(normalizedSearchQuery);
        }),
        ...trends.filter(trend => {
          const albumTitle = trend.tenAlbum ? removeVietnameseTones(trend.tenAlbum.toLowerCase()) : '';
          const albumCSi = trend.caSi ? removeVietnameseTones(trend.caSi.toLowerCase()) : '';
          return albumTitle.includes(normalizedSearchQuery) || albumCSi.includes(normalizedSearchQuery);
        }),
        ...artists.filter(artist => {
          const artistName = artist.name ? removeVietnameseTones(artist.name.toLowerCase()) : '';
          return artistName.includes(normalizedSearchQuery);
        }),
      ];

      // Lọc theo loại kết quả
      if (type === 'All') {
        setFilteredResults(allResults);
      } else if (type === 'Tracks') {
        setFilteredResults(allResults.filter(item => item.tenBaiHat)); // Lọc chỉ bài hát
      } else if (type === 'Albums') {
        setFilteredResults(allResults.filter(item => item.tenAlbum)); // Lọc chỉ album
      } else if (type === 'Artists') {
        setFilteredResults(allResults.filter(item => item.name)); // Lọc chỉ nghệ sĩ
      }
    }
  };


  const removeVietnameseTones = (str) => {
    return str
      .normalize('NFD') // Chuẩn hóa chuỗi Unicode về dạng tổ hợp
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
      .toLowerCase(); // Chuyển về chữ thường
  };


  const handleSearch = () => {
    if (searchQuery === '') {
      setFilteredResults([]); // Nếu không có từ khóa tìm kiếm, không hiển thị gì
    } else {
      // Chuyển từ khóa tìm kiếm thành không dấu
      const normalizedSearchQuery = removeVietnameseTones(searchQuery).split(' ').filter(word => word.length > 0);

      const allResults = [
        ...songs.filter(song => {
          const songTitle = song.tenBaiHat ? removeVietnameseTones(song.tenBaiHat.toLowerCase()) : ''; 
          const songCaSi = song.caSi ? removeVietnameseTones(song.caSi.toLowerCase()) : '';
          return songTitle.includes(normalizedSearchQuery) || songCaSi.includes(normalizedSearchQuery);
        }),
        ...trends.filter(trend => {
          const albumTitle = trend.tenAlbum ? removeVietnameseTones(trend.tenAlbum.toLowerCase()) : '';
          const albumCSi = trend.caSi ? removeVietnameseTones(trend.caSi.toLowerCase()) : '';
          return albumTitle.includes(normalizedSearchQuery) || albumCSi.includes(normalizedSearchQuery);
        }),
        ...artists.filter(artist => {
          const artistName = artist.name ? removeVietnameseTones(artist.name.toLowerCase()) : '';
          return artistName.includes(normalizedSearchQuery);
        }),
      ];

      if (filterType === 'All') {
        setFilteredResults(allResults);
      } else if (filterType === 'Tracks') {
        setFilteredResults(allResults.filter(item => item.tenBaiHat)); // Lọc chỉ các bài hát
      } else if (filterType === 'Albums') {
        setFilteredResults(allResults.filter(item => item.tenAlbum)); // Lọc chỉ các album
      } else if (filterType === 'Artists') {
        setFilteredResults(allResults.filter(item => item.name)); // Lọc chỉ các nghệ sĩ
      }

      if (allResults.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }
    }
  };

  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };



  const renderSong = ({ item }) => {
    if (item.tenBaiHat) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('PN', item)}>
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

    } else if (item.tenAlbum) {
      return (
        <TouchableOpacity onPress={() => {
          if (!item || !songs || songs.length === 0) {
            console.log("Dữ liệu không hợp lệ hoặc không có bài hát.");
            return;
          }
          const normalizeString = (str) => str?.toLowerCase().trim() || '';
          const relatedSongs = songs.filter(song => normalizeString(song.caSi) === normalizeString(item.caSi));
          navigation.navigate('Album', { album: item, songs: relatedSongs });
        }}>
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
    } else if (item.name) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Artist', { item })}>
          <View style={styles.artItem}>
              <View style={{
                flexDirection:'row',
              }}>
                  <Image source={{uri: item.anh}} style={styles.artImg} />
                  <View>
                      <Text style={styles.nameartist}>{item.name}</Text>
                      <View style={{
                        flexDirection:'row',
                      }}>
                          <FontAwesome style={styles.icon} name="users" size={15} color="gray" />
                          <Text style={styles.fl}>{item.follow}</Text>
                      </View>
                  </View>
              </View>
              <View>
                <TouchableOpacity 
                  style={styles.followButton}
                  onPress={() => toggleFollowArtist(item)} // Hàm này sẽ thay thế thao tác follow/unfollow
                >
                  <Text style={styles.followText}>
                    {followedArtists.some((s) => s.id === item.id) ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
          </View>
        </TouchableOpacity>
      );
    }
    return null; // Nếu không phải bài hát, album, hay nghệ sĩ
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredResults([]); // Clear filtered results when the input is cleared
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.row1}>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>
        <View style={styles.row3}>
          <TextInput
            style={styles.searchInput}
            placeholder="What you want to listen to"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)} // Không gọi handleSearch khi nhập
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <FontAwesome style={styles.icon} name="times-circle" size={15} color="gray" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearch}> {/* Chỉ gọi handleSearch khi nhấn nút Search */}
            <FontAwesome style={styles.icon} name="search" size={15} color="gray" />
          </TouchableOpacity>
        </View>
        <View style={styles.row2}>
          <TouchableOpacity style={styles.butrow2} onPress={() => handleFilterChange('All')}>
            <Text style={styles.tex1}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butrow2} onPress={() => handleFilterChange('Tracks')}>
            <Text style={styles.tex1}>Tracks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butrow2} onPress={() => handleFilterChange('Albums')}>
            <Text style={styles.tex1}>Albums</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butrow2} onPress={() => handleFilterChange('Artists')}>
            <Text style={styles.tex1}>Artists</Text>
          </TouchableOpacity>
        </View>
        {noResults && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>Không có kết quả</Text>
          </View>
        )}
        <FlatList
          data={filteredResults}
          renderItem={renderSong}
          keyExtractor={(item, index) => index.toString()}
        />

        <AddToPlaylistModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedSong={selectedSong}
      />

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
  noResultsContainer:{
    justifyContent:'center',
    alignItems:'center',
  },
  noResultsText:{
    fontWeight:'bold',
    color:'gray',
  },
  row6:{
    backgroundColor:'white',
    position: 'absolute',
    bottom: 0, 
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
  artItem: {
    padding:10,
    justifyContent:'space-between',
    flexDirection:'row',
    alignItems:'center',
    width: 320,
    height: 60 ,
    marginRight: 15,
  },
  artImg: {
    margin:5,
    borderRadius:20,
    width: 50,
    height:50,
  },
  nameartist:{
    marginTop:8,
    marginBottom:5,
    fontWeight:'bold',
  },
  followButton:{
    padding:7,
    borderWidth:1,
    borderRadius:20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  tex1: {
    color: 'gray',
    fontWeight: 'bold',
  },
  butrow2: {
    padding: 20,
  },
  row2: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row3: {
    left:10,
    flexDirection: 'row',
    width: 300,
    borderWidth: 1,
    borderRadius: 20,
    padding: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginVertical: 15,
  },
  searchInput: {
    flex: 1,
    height: 30,
    padding: 5,
    borderColor: 'white',
  },
  icon: {
    paddingHorizontal: 5,
  },
  row1: {
    marginVertical: 10,
    width: '100%',
    marginLeft:10,
  },
  timeText: {
    fontSize: 15,
    color: 'black',
  },
  
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 5,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'gray',
  },
});
