import { useEffect, useRef, createRef } from "react";
import PropTypes from "prop-types";
import WFPlayer from "wfplayer";

const WaveformTimeline = ({ videoRef }) => {
  const waveformRef = createRef();
  const wfPlayerInstance = useRef(null);

  useEffect(() => {
    [...WFPlayer.instances].forEach((item) => item.destroy());

    if (!waveformRef.current || !videoRef.current) return;

    // Initialize WFPlayer
    wfPlayerInstance.current = new WFPlayer({
      container: waveformRef.current,
      mediaElement: videoRef.current,
      scrollable: true,
      useWorker: false,
      duration: 10,
      padding: 1,
      wave: true,
      pixelRatio: 2,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      waveColor: 'rgba(255, 255, 255, 0.2)',
      progressColor: 'rgba(255, 255, 255, 0.5)',
      gridColor: 'rgba(255, 255, 255, 0.05)',
      rulerColor: 'rgba(255, 255, 255, 0.5)',
      paddingColor: 'rgba(0, 0, 0, 0)',
    });

    wfPlayerInstance.current.load(videoRef.current.src);

    return () => {
      wfPlayerInstance.current?.destroy();
    };
  }, [videoRef]);

  return (
    <div className="waveform" ref={waveformRef} style={{  width: "100%", height: "100%"}}></div>
  );
};

WaveformTimeline.propTypes = {
  videoRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
};

export default WaveformTimeline;