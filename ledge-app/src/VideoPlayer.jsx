import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import Duration from './Duration';
import './videoPlayer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const VideoPlayer = () => {

    const [url, setUrl] = useState('https://www.youtube.com/watch?v=ZA7ZKB8Mo9k&ab_channel=FeidVEVO');
    const [pip, setPip] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [controls, setControls] = useState(false);
    const [light, setLight] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [loop, setLoop] = useState(false);
    const [seeking, setSeeking] = useState(false);
    const [player, setPlayer] = useState(null);
    const [urlInput, setUrlInput] = useState(null);
    const [visualization, setVisualization] = useState(null);
    const [totalVisualizations, setTotalVisualizations] = useState(0);
    const [visualizationCounted, setVisualizationCounted] = useState(false);

    const load = (url) => {
        setUrl(url);
        setPlayed(0);
        setLoaded(0);
        setPip(false);
    }

    const handlePlayPause = () => {
        setPlaying(!playing);
    }

    const handleStop = () => {
        setUrl(null);
        setPlaying(false);
    }

    const handleToggleControls = () => {
        const url = url;
        setControls(!controls);
        load(url);
    }

    const handleToggleLight = () => {
        setLight(!light);
    }

    const handleToggleLoop = () => {
        setLoop(!loop);
    }

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    }

    const handleToggleMuted = () => {
        setMuted(!muted);
    }

    const handleSetPlaybackRate = (e) => {
        console.log('handleSetPlaybackRate', e.target.value)
        setPlaybackRate(parseFloat(e.target.value));
    }

    const handleOnPlaybackRateChange = (speed) => {
        setPlaybackRate(parseFloat(speed));
    }

    const handleTogglePIP = () => {
        setPip(!pip);
    }

    const handlePlay = () => {
        console.log('onPlay')
        setPlaying(true);
    }

    const handleEnablePIP = () => {
        console.log('onEnablePIP')
        setPip(true);
    }

    const handleDisablePIP = () => {
        console.log('onDisablePIP')
        setPip(false);
    }

    const handlePause = () => {
        console.log('onPause')
        setPlaying(false);
    }

    const handleSeekMouseDown = (e) => {
        setSeeking(true);
    }

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    }

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        player.seekTo(parseFloat(e.target.value));
    }

    const handleProgress = (state) => {
        console.log('onProgress', state)
        if (!seeking) {
            setPlayed(state.played);
            setLoaded(state.loaded);
        }
        if (state.played > 0.6 && !visualizationCounted) {
            console.log('visualization counted')
            addVisualization();
            setTotalVisualizations(totalVisualizations + 1);
            setVisualizationCounted(true);
        }

    }

    const handleEnded = () => {
        console.log('onEnded')
        setPlaying(loop);
    }

    const handleDuration = (duration) => {
        console.log('onDuration', duration)
        setDuration(duration);
    }

    const handleClickFullscreen = () => {
        screenfull.request(player);
    }

    const ref = (player) => {
        setPlayer(player);
    }

    const handleInputChange = (e) => {
        setUrlInput(e.target.value);
    };

    const handleLoad = () => {
        console.log('handleLoad')
        load(urlInput);
    };

    function cleanURL(url) {
        url = url.replace("http://", "");
    
        url = url.replace(/[^a-zA-Z0-9]/g, '');
    
        return url;
    }

    const addVisualization = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/visualization/${visualization.id}`);
            console.log("response:", response.data.message)
        } catch (error) {
            console.error("Error fetching visualizations:", error);
        }
    
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cleanedURL = cleanURL(url);
                const response = await axios.get(`http://localhost:8080/visualization/${cleanedURL}`);
                console.log("response:", response.data.visualization)
                setVisualization(response.data.visualization);
                setTotalVisualizations(response.data.visualization.count);
            } catch (error) {
                console.error("Error fetching visualizations:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='app'>
            <section className='section'>
                <h1 >React Player</h1>
                <div className='player-wrapper'>
                    <ReactPlayer
                    ref={ref}
                    className='react-player'
                    width='100%'
                    height='100%'
                    url={url}
                    pip={pip}
                    playing={playing}
                    controls={controls}
                    light={light}
                    loop={loop}
                    playbackRate={playbackRate}
                    volume={volume}
                    muted={muted}
                    onReady={() => console.log('onReady')}
                    onStart={() => console.log('onStart')}
                    onPlay={handlePlay}
                    onEnablePIP={handleEnablePIP}
                    onDisablePIP={handleDisablePIP}
                    onPause={handlePause}
                    onBuffer={() => console.log('onBuffer')}
                    onPlaybackRateChange={handleOnPlaybackRateChange}
                    onSeek={e => console.log('onSeek', e)}
                    onEnded={handleEnded}
                    onError={e => console.log('onError', e)}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onPlaybackQualityChange={e => console.log('onPlaybackQualityChange', e)}
                    />
                </div>
                <table>
                <tbody>
                <tr>
                    <th>Visualizations</th>
                    <td>
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: '20px', marginRight: '8px' }} />
                        {totalVisualizations}
                    </td>
                </tr>
                <tr>
                <th>Custom URL</th>
                <td>
                  <input 
                    type='text' 
                    placeholder='Enter URL' 
                    value={urlInput}
                    onChange={handleInputChange}/>
                  <button onClick={handleLoad}>Load</button>
                </td>
              </tr>
                <tr>
                    <th>Controls</th>
                    <td>
                    <button onClick={handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
                    </td>
                </tr>
                <tr>
                    <th>Seek</th>
                    <td>
                    <input
                        type='range' min={0} max={0.999999} step='any'
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                    />
                    </td>
                </tr>
                <tr>
                    <th>Volume</th>
                    <td>
                    <input type='range' min={0} max={1} step='any' value={volume} onChange={handleVolumeChange} />
                    </td>
                </tr>
                <tr>
                    <th>Played</th>
                    <td><progress max={1} value={played} /></td>
                </tr>
                <tr>
                    <th>Loaded</th>
                    <td><progress max={1} value={loaded} /></td>
                </tr>
                <tr>
                <th>Duration</th>
                <td><Duration seconds={duration} /></td>
              </tr>
              <tr>
                <th>Elapsed</th>
                <td><Duration seconds={duration * played} /></td>
              </tr>
              <tr>
                <th>Remaining</th>
                <td><Duration seconds={duration * (1 - played)} /></td>
              </tr>
                </tbody>
            </table>
        </section>
    </div>
    )
}

export default VideoPlayer;