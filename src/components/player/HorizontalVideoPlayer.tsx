import { View } from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import YoutubePlayer from 'react-native-youtube-iframe';

// 3. 가로비디오 컴포넌트
interface HorizontalVideoPlayerProps {
  videoId: string;
  onChangeState: (state: PLAYER_STATES) => void;
  onReady: () => void;
  onError: (error: any) => void;
}

const HorizontalVideoPlayer: React.FC<HorizontalVideoPlayerProps> = ({
  videoId,
  onChangeState,
  onReady,
  onError,
}) => {
  return (
    <View>
      <YoutubePlayer
        height={190}
        play={true}
        videoId={videoId}
        onChangeState={onChangeState}
        webViewStyle={{ opacity: 0.99 }}
        webViewProps={{
          androidLayerType: 'hardware',
          allowsFullscreenVideo: true,
          mediaPlaybackRequiresUserAction: false,
          javaScriptEnabled: true,
          domStorageEnabled: true,
        }}
        onReady={onReady}
        mute={true}
        forceAndroidAutoplay={true}
        initialPlayerParams={{
          cc_lang_pref: 'ko',
          showClosedCaptions: false,
          controls: true,
          loop: false,
          preventFullScreen: false,
          playerLang: 'ko',
          iv_load_policy: 3,
        }}
        onError={onError}
      />
    </View>
  );
};

export default HorizontalVideoPlayer;
