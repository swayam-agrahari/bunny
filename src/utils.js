import Sub from "@/lib/Sub";

export function isPlaying($video) {
    return !!($video.currentTime > 0 && !$video.paused && !$video.ended && $video.readyState > 2);
}

export function getCurrentSubs(subs, beginTime, duration) {
    if( !subs ) return
    return subs.filter((item) => {
        return (
            (item.startTime >= beginTime && item.startTime <= beginTime + duration) ||
            (item.endTime >= beginTime && item.endTime <= beginTime + duration) ||
            (item.startTime < beginTime && item.endTime > beginTime + duration)
        );
    });
}
export function newSub(item){
    return new Sub(item);
}

export function hasSub(sub, subtitle){
    return subtitle.indexOf(sub)
}
