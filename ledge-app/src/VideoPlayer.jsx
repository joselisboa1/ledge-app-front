import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import Duration from './Duration';
import './videoPlayer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const VideoPlayer = () => {

    const [url, setUrl] = useState('https://www.youtube.com/watch?v=RK27RX54EJU&ab_channel=JackMurphy');
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
    const [previousURL, setPreviousURL] = useState(null);
    const [error, setError] = useState(false);

    const load = (new_url) => {
        if (new_url != previousURL){
            setError(false);
        }
        setPreviousURL(url);
        setUrl(new_url);
        setPlayed(0);
        setLoaded(0);
        setPip(false);
    }

    const handlePlayPause = () => {
        setPlaying(!playing);
    }

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    }

    const handleOnPlaybackRateChange = (speed) => {
        setPlaybackRate(parseFloat(speed));
    }

    const handlePlay = () => {
        setPlaying(true);
    }

    const handleEnablePIP = () => {
        setPip(true);
    }

    const handleDisablePIP = () => {
        setPip(false);
    }

    const handlePause = () => {
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
        if (!seeking) {
            setPlayed(state.played);
            setLoaded(state.loaded);
        }
        if (state.played > 0.6 && !visualizationCounted) {
            addVisualization();
            setTotalVisualizations(totalVisualizations + 1);
            setVisualizationCounted(true);
        }

    }

    const handleEnded = () => {
        setPlaying(loop);
    }

    const handleDuration = (duration) => {
        setDuration(duration);
    }

    const ref = (player) => {
        setPlayer(player);
    }

    const handleInputChange = (e) => {
        setUrlInput(e.target.value);
    };

    const handleLoad = () => {
        load(urlInput);
    };

    const handleRestart = () => {
        setPlayed(0);
        player.seekTo(0);
    }

    const handleError = (err) => {
        console.error(err);
        setError(true);
        load(previousURL);
    }

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
                <h1 >Ledge React Player</h1>
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
                    onPlay={handlePlay}
                    onEnablePIP={handleEnablePIP}
                    onDisablePIP={handleDisablePIP}
                    onPause={handlePause}
                    onPlaybackRateChange={handleOnPlaybackRateChange}
                    onEnded={handleEnded}
                    onError={handleError}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
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
                  <p style={{ color: 'red' }}>{error ? 'Invalid URL' : ''}</p>
                </td>
              </tr>
                <tr>
                    <th>Controls</th>
                    <td>
                    <button onClick={handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
                    <button onClick={handleRestart}>Restart</button>
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