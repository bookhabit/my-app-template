import { useState } from "react";
import { Dimensions, LayoutRectangle, View } from "react-native";
import { PLAYER_STATES } from "react-native-youtube-iframe";
import YoutubePlayer from "react-native-youtube-iframe";

// 세로비디오 컴포넌트 (Shorts)
interface ShortsVideoPlayerProps {
  videoId: string;
  onChangeState: (state: PLAYER_STATES) => void;
  onReady: () => void;
  onError: (error: any) => void;
  layout: LayoutRectangle;
}

const ShortsVideoPlayer: React.FC<ShortsVideoPlayerProps> = ({
  videoId,
  onChangeState,
  onReady,
  onError,

  layout,
}) => {
  return (
    <YoutubePlayer
      height={layout.height}
      width={layout.width}
      play={true}
      videoId={videoId}
      onChangeState={onChangeState}
      webViewStyle={{
        opacity: 0.99,
        backgroundColor: "#000",
      }}
      webViewProps={{
        androidLayerType: "hardware",
        allowsFullscreenVideo: true,
        mediaPlaybackRequiresUserAction: false,
        javaScriptEnabled: true,
        domStorageEnabled: true,
        injectedJavaScript: `
          var element = document.getElementsByClassName('container')[0];
          if (element) {
            element.style.position = 'unset';
          }
          true;
        `,
      }}
      onReady={onReady}
      mute={true}
      forceAndroidAutoplay={true}
      initialPlayerParams={{
        cc_lang_pref: "ko",
        showClosedCaptions: false,
        controls: true,
        loop: false,
        preventFullScreen: false,
        playerLang: "ko",
        iv_load_policy: 3,
      }}
      onError={onError}
    />
  );
};

export default ShortsVideoPlayer;
