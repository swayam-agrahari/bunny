import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import WFPlayer from "wfplayer";
import clamp from "lodash/clamp";

const WaveformTimeline = ({ videoRef, subtitles, onSubtitleAdd, onSubtitleDelete }) => {
  const waveformRef = useRef(null);
  const wfPlayerInstance = useRef(null);
  const [currentScroll, setCurrentScroll] = useState(0);
  const [interaction, setInteraction] = useState({
    type: null, // 'create', 'drag', 'resize'
    index: null,
    startX: null,
    currentX: null,
    resizeHandle: null // 'left' or 'right'
  });

  const scrollSpeed = 0.01;
  const viewDuration = 10;

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    if (!videoRef.current || !wfPlayerInstance.current) return;

    const videoDuration = videoRef.current.duration;
    const newScroll = clamp(
      currentScroll + (event.deltaY * scrollSpeed),
      0,
      videoDuration - viewDuration
    );

    setCurrentScroll(newScroll);
    wfPlayerInstance.current.seek(newScroll);
  }, [currentScroll, videoRef]);

  const getTimeFromX = useCallback((x) => {
    if (!waveformRef.current) return 0;
    const rect = waveformRef.current.getBoundingClientRect();
    return currentScroll + (x / rect.width) * viewDuration;
  }, [currentScroll]);

  const checkOverlap = useCallback((start, end, excludeIndex = null) => {
    return subtitles.some((subtitle, index) =>
      index !== excludeIndex && (start < subtitle.end && end > subtitle.start)
    );
  }, [subtitles]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setInteraction({
      type: 'create',
      index: null,
      startX: x,
      currentX: x,
      resizeHandle: null
    });
  }, []);

  const handleSubtitleMouseDown = useCallback((e, index, handle = null) => {
    e.stopPropagation();
    const rect = waveformRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setInteraction({
      type: handle ? 'resize' : 'drag',
      index,
      startX: x,
      currentX: x,
      resizeHandle: handle
    });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!interaction.type || !waveformRef.current) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const currentX = clamp(e.clientX - rect.left, 0, rect.width);

    setInteraction(prev => ({ ...prev, currentX }));

    if (interaction.type === 'create') {
      // Creating new subtitle - handled in mouseup
      return;
    }

    const subtitle = subtitles[interaction.index];
    const deltaTime = getTimeFromX(currentX) - getTimeFromX(interaction.startX);

    let newStart = subtitle.start;
    let newEnd = subtitle.end;

    if (interaction.type === 'drag') {
      const duration = subtitle.end - subtitle.start;
      newStart = clamp(subtitle.start + deltaTime, currentScroll, currentScroll + viewDuration - duration);
      newEnd = newStart + duration;
    } else if (interaction.type === 'resize') {
      if (interaction.resizeHandle === 'left') {
        newStart = clamp(subtitle.start + deltaTime, currentScroll, subtitle.end - 0.1);
      } else {
        newEnd = clamp(subtitle.end + deltaTime, subtitle.start + 0.1, currentScroll + viewDuration);
      }
    }

    if (!checkOverlap(newStart, newEnd, interaction.index)) {
      onSubtitleAdd({
        ...subtitle,
        start: newStart,
        end: newEnd
      }, interaction.index);

      setInteraction(prev => ({ ...prev, startX: currentX }));
    }
  }, [interaction, subtitles, currentScroll, checkOverlap, getTimeFromX, onSubtitleAdd]);

  const handleMouseUp = useCallback(() => {
    if (interaction.type === 'create' && interaction.startX !== interaction.currentX) {
      const startTime = getTimeFromX(Math.min(interaction.startX, interaction.currentX));
      const endTime = getTimeFromX(Math.max(interaction.startX, interaction.currentX));

      if (!checkOverlap(startTime, endTime) && endTime - startTime > 0.1) {
        onSubtitleAdd({
          start: startTime,
          end: endTime,
          text: "New subtitle"
        });
      }
    }

    setInteraction({
      type: null,
      index: null,
      startX: null,
      currentX: null,
      resizeHandle: null
    });
  }, [interaction, getTimeFromX, checkOverlap, onSubtitleAdd]);

  useEffect(() => {
    const waveformElement = waveformRef.current;
    if (!waveformElement) return;

    waveformElement.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      waveformElement.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    [...WFPlayer.instances].forEach((item) => item.destroy());

    if (!waveformRef.current || !videoRef.current) return;

    wfPlayerInstance.current = new WFPlayer({
      container: waveformRef.current,
      mediaElement: videoRef.current,
      scrollable: true,
      useWorker: false,
      duration: viewDuration,
      padding: 1,
      wave: true,
      pixelRatio: 2,
      backgroundColor: "rgba(0, 0, 0, 0)",
      waveColor: "rgba(255, 255, 255, 0.2)",
      progressColor: "rgba(255, 255, 255, 0.5)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      rulerColor: "rgba(255, 255, 255, 0.5)",
      paddingColor: "rgba(0, 0, 0, 0)",
    });

    wfPlayerInstance.current.load(videoRef.current.src);

    return () => {
      wfPlayerInstance.current?.destroy();
    };
  }, [videoRef]);

  const renderSubtitlesAndOverlay = () => {
    if (!videoRef.current) return null;

    return (
      <>
        {subtitles.map((subtitle, index) => {
          if (subtitle.start > currentScroll + viewDuration || subtitle.end < currentScroll) {
            return null;
          }

          const startPercent = ((subtitle.start - currentScroll) / viewDuration) * 100;
          const widthPercent = ((subtitle.end - subtitle.start) / viewDuration) * 100;
          const isActive = interaction.index === index;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                height: "100%",
                top: "0",
                backgroundColor: isActive ? "rgba(76, 175, 80, 0.7)" : "rgba(76, 175, 80, 0.5)",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
                cursor: interaction.type === 'drag' && isActive ? "grabbing" : "grab",
                zIndex: isActive ? 3 : 2,
                userSelect: "none"
              }}
              onMouseDown={(e) => handleSubtitleMouseDown(e, index)}
              onDoubleClick={() => onSubtitleDelete(index)}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "8px",
                  height: "100%",
                  cursor: "ew-resize"
                }}
                onMouseDown={(e) => handleSubtitleMouseDown(e, index, 'left')}
              />

              <span style={{ pointerEvents: "none" }}>{subtitle.text}</span>

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "8px",
                  height: "100%",
                  cursor: "ew-resize"
                }}
                onMouseDown={(e) => handleSubtitleMouseDown(e, index, 'right')}
              />
            </div>
          );
        })}

        {interaction.type === 'create' && interaction.startX !== interaction.currentX && (
          <div
            style={{
              position: "absolute",
              left: `${Math.min(interaction.startX, interaction.currentX)}px`,
              width: `${Math.abs(interaction.currentX - interaction.startX)}px`,
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "4px",
              pointerEvents: "none"
            }}
          />
        )}
      </>
    );
  };

  return (
    <div
      ref={waveformRef}
      style={{
        width: "100%",
        height: "100px",
        position: "relative",
        cursor: interaction.type === 'create' ? "col-resize" : "default",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        overflow: "hidden"
      }}
      onMouseDown={handleMouseDown}
    >
      {renderSubtitlesAndOverlay()}
    </div>
  );
};

WaveformTimeline.propTypes = {
  videoRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  subtitles: PropTypes.array.isRequired,
  onSubtitleAdd: PropTypes.func.isRequired,
  onSubtitleDelete: PropTypes.func.isRequired
};

export default WaveformTimeline;