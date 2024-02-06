# Youtube thumbnails for the youtube player in Nitro  

```shell
mkdir /var/www/retrohotel/CMS/public/youtube
mkdir /var/www/retrohotel/CMS/public/youtube/cache
chown -R nobody:nogroup /var/www/retrohotel/CMS/public/youtube/cache
```
If you use a different location make sure that you make the cache dir writeable !  

```shell
vi /var/www/retrohotel/CMS/public/youtube/youtube_image.php
```
Add the following code:  
```
<?php
$url = $_GET['youtube_id'];
$finalurl = 'https://img.youtube.com/vi/' . $url . '/default.jpg';
$localcache = './cache/' . $url . '.jpg';

// Time to cache the files (here: 10 minutes)
define('time_to_cache', 600);

// Create a local file representation
$local = './cache/' . urlencode($url . '.jpg');

// Determine whether the local file is too old
if (@filemtime($local) + time_to_cache < time()) {
    // Download a fresh copy
    copy ($finalurl , $localcache);
}

// Solution 1: Redirect to the local cache file
Header('Location: ' . urlencode($local));
exit();
?>
```
```shell
mariadb
```
```mysql
UPDATE emulator_settings SET value='https://#### YOUR URL ####/youtube/youtube_image.php?youtube_id=%video%' WHERE  `key`='imager.url.youtube';
```
**!!! Change it to your url, and also please note that you either have to stop the emulator or use the command :update_settings in the client otherwise it will go back to default after stopping the emulator !!!**  

Also make the following change  (not needed for the thumbnails)

```mysql
UPDATE emulator_settings SET value='#### YOUR API Key ####' WHERE  `key`='youtube.apikey';
```
You will find [here](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjxt9zw9oP3AhXQAewKHeaKBXIQFnoECAkQAQ&url=https%3A%2F%2Fdevelopers.google.com%2Fyoutube%2Fv3%2Fgetting-started&usg=AOvVaw3ueucBVp-4rmSh_si8y-vP) more info how to set this up !  

Your Tumbnail has been done !


