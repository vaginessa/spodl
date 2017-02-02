var config = require('../config.js');
var SpotifyWebApi = require('spotify-web-api-node');
var YouTube = require('youtube-node');
var sys = require('sys');
var exec = require('child_process').exec;
var child;

//Spotify

var clientId = config.spotify.clientid,
    clientSecret = config.spotify.clientsecret;

var spotifyApi = new SpotifyWebApi({
  clientId : clientId,
  clientSecret : clientSecret
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.getPlaylist(config.spotify.username, config.spotify.playlistid)
    .then(function(data) {
      var searchTerm = data.body.tracks.items[0].track.artists[0].name + ': ' + data.body.tracks.items[0].track.name;
      console.log("Search term: "+searchTerm);
      yt(searchTerm);
    }, function(err) {
      console.log('Something went wrong!', err);
    });
  }, function(err) {
        console.log('Something went wrong when retrieving an access token', err);
  });

//Youtube

function yt(searchTerm){
  var youTube = new YouTube();

  youTube.setKey(config.youtube.apikey);
  youTube.search(searchTerm, 1, function(error, result) {
    if (error) {
      console.log(error);
    }
    else {
      var id = result.items[0].id.videoId
      var url = 'https://www.youtube.com/watch?v='+id;
      console.log('Youtube url: '+url);
      dl(url);
    }
  });
}

//Downloading

function dl(url){
  child = exec("youtube-dl --extract-audio --audio-format mp3 "+url, function(error, stdout, stderr){
    if(error){
      console.log('exec error: '+error);
    } else {
      sys.print('stdout: '+stdout);
    }
  });
}