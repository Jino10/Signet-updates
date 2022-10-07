import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { fetchCall } from '../../Services/APIService';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { hidefcWidget, initFCWidget, showfcWidget } from './FreshChat';
import { userRoleId } from '../../Utilities/AppUtilities';
import './Chats.css';
import Loading from '../Widgets/Loading';
// import { Button } from 'react-bootstrap';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import ReactPlayer from 'react-player';
import { Container, Grid, Typography, IconButton, Slider, Button, Popover } from '@mui/material';
import { FastRewind, FastForward, PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen } from '@mui/icons-material';
import screenfull from 'screenfull';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Chats() {
  const location = useLocation();
  const [snackBar, setSnackBar] = useState(false);
  const [isLoading, setIsLoading] = useState(location.state != null ? location.state.showLoader : true);
  const roledId = localStorage.getItem('roleId');
  const { buttonTracker } = useAnalyticsEventTracker();
  const playerRef = useRef(null);
  const [playState, setPlayState] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playBackRate, setPlayBackRate] = useState(1.0);
  const ScreenRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const timeIntervalRef = useRef(null);

  useEffect(() => {
    if (roledId === userRoleId.remoteSmartUser) {
      if (!window.fcWidget.isInitialized()) {
        initFCWidget().then(() => showfcWidget());
      } else {
        showfcWidget();
      }
    }

    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 7000);
    }

    if (localStorage.getItem('contactSales') === 'true') {
      setSnackBar(true);
    }
  }, [isLoading, roledId]);
  /* Component cleanup function call start  */
  useEffect(
    () => () => {
      hidefcWidget().then();
    },
    [],
  );
  /* Component cleanup function call end  */
  const handleClick = async () => {
    const [statusCode] = await fetchCall(APIUrlConstants.CONTACT_SALES + '/' + localStorage.getItem('id'), apiMethods.POST, {});
    if (statusCode === httpStatusCode.SUCCESS) {
      setSnackBar(true);
      localStorage.setItem('contactSales', 'true');
    }
  };

  const handlePlay = () => {
    setPlayState(true);
  }
  const handlePause = () => {
    setPlayState(false);
  }

  const handleRewind = () => {
    playerRef.current.seekTo?.(playerRef.current.getCurrentTime() - 10);
  }
  const handleFastForward = () => {
    playerRef.current.seekTo?.(playerRef.current.getCurrentTime() + 10);
  }

  const handleVolumeOff = () => {
    setMuted(true);
  }
  const handleVolumeUp = () => {
    setMuted(false);
  }

  const onVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value / 100));
    if (volume <= 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handlePopOver = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'playBackRate-popover' : '';

  const handlePlaybackRate = (rate) => {
    setPlayBackRate(rate);
    handleClose();
  }

  const handleFullScreen = () => {
    screenfull.request(ScreenRef.current);
  }

  const second = Math.floor(currentTime % 60);
  const minute = Math.floor((currentTime % 3600) / 60);
  const hour = Math.floor((currentTime % (3600 * 24)) / 3600);
  const currentMoment = `${hour}:${minute}:${second}`;

  const totalValue = playerRef.current?.getDuration();
  const seconds = Math.floor(totalValue % 60);
  const minutes = Math.floor((totalValue % 3600) / 60);
  const hours = Math.floor((totalValue % (3600 * 24)) / 3600);
  const totalMoment = `${hours}:${minutes}:${seconds}`;

  const timeInterval = () => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(playerRef.current?.getCurrentTime());
    }, 1000);
    return () => {
      clearInterval(timeIntervalRef.current);
    }
  }

  useEffect(() => {
    if (currentTime === totalValue) {
      setPlayState(false);
      clearInterval(timeIntervalRef.current);
    }
  }, [currentTime]);

  useEffect(() => {
    if (playState === true) {
      timeInterval();
    } else {
      clearInterval(timeIntervalRef.current);
    }
  }, [playState]);

  const currentVariable = (currentTime / totalValue) * 100;

  // for Signet https://signet-group-public.s3.amazonaws.com/Animate+-+22182.mp4
  // for Youtube https://www.youtube.com/watch?v=tUP5S4YdEJo
  return (
    <div className="wrapperBase">
      {isLoading && <Loading />}
      {roledId !== userRoleId.remoteSmartUser && (
        <div className="wrapperCard">
          <div className="wrapperCard--header">
            <div className="titleHeader">
              <div className="info">
                <h6>Chat Demo</h6>
              </div>
            </div>
          </div>
          <div className="wrapperCard--body">
            <div className="videoWrapper">
              <Container>
                <div ref={ScreenRef}>
                  <ReactPlayer
                    ref={playerRef}
                    url='https://signet-group-public.s3.amazonaws.com/Animate+-+22182.mp4'
                    playing={playState}
                    muted={muted}
                    volume={volume}
                    playbackRate={playBackRate}
                  />
                  <div>
                    <Grid Container>
                      <Grid item>
                        <Typography className='Heading'>Chat Demo</Typography>
                      </Grid>
                    </Grid>
                    <Grid className='playPauseIcons' Container direction='row' alignItems='center' justify='space-between'>
                      <IconButton onClick={handleRewind}>
                        <FastRewind className='Icons' fontSize='inherit' />
                      </IconButton>

                      {playState ?
                        <IconButton onClick={handlePause}>
                          <Pause className='Icons' fontSize='inherit' />
                        </IconButton> :
                        <IconButton onClick={handlePlay}>
                          <PlayArrow className='Icons' fontSize='inherit' />
                        </IconButton>}

                      <IconButton onClick={handleFastForward}>
                        <FastForward className='Icons' fontSize='inherit' />
                      </IconButton>
                    </Grid>

                    {playState ?
                      <IconButton onClick={handlePause} className='playIcon'>
                        <Pause className='Icons' fontSize='large' />
                      </IconButton> :
                      <IconButton onClick={handlePlay} className='playIcon'>
                        <PlayArrow className='Icons' fontSize='large' />
                      </IconButton>}

                    {muted ?
                      <IconButton onClick={handleVolumeUp} className='volumeIcon'>
                        <VolumeOff className='Icons' fontSize='large' />
                      </IconButton> :
                      <IconButton onClick={handleVolumeOff} className='volumeIcon'>
                        <VolumeUp className='Icons' fontSize='large' />
                      </IconButton>}

                    <Slider className='volumeSlider'
                      min={0}
                      max={100}
                      value={volume * 100}
                      onChange={onVolumeChange}
                    />
                    <Button className='currentTime' variant='text'>
                      <Typography className='Icons'>{currentMoment}</Typography>
                    </Button>

                    <Button onClick={handlePopOver} className='playBackRate' variant='text'>
                      <Typography className='Icons'>{playBackRate}X</Typography>
                    </Button>

                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                      }}
                    >
                      <Grid Container direction='column-reverse'>
                        {[0.5, 1.0, 1.5, 2.0].map((rate) =>
                          <Button onClick={() => handlePlaybackRate(rate)} variant='text'>
                            <Typography color={rate === playBackRate ? 'secondary' : 'default'}>{rate}</Typography>
                          </Button>
                        )}
                      </Grid>
                    </Popover>

                    <IconButton onClick={handleFullScreen} className='fullscreen'>
                      <Fullscreen className='Icons' fontSize='large' />
                    </IconButton>

                    <Slider className='moveSlider'
                      min={0}
                      max={100}
                      value={currentVariable}
                    />

                    <Button className='totalValue' variant='text'>
                      <Typography className='Icons'>{totalMoment}</Typography>
                    </Button>

                    <IconButton className='moreVertical'>
                      <MoreVertIcon className='Icons' fontSize='large' />
                    </IconButton>

                    <IconButton className='settingsIcon'>
                      <SettingsIcon className='Icons' fontSize='large' />
                    </IconButton>
                  </div>
                </div>
              </Container>
            </div>
            {!snackBar && (
              <Button
                className="buttonPrimary mb-5"
                onClick={() => {
                  buttonTracker(gaEvents.CONTACT_SALES);
                  handleClick();
                }}
              >
                Contact Sales
              </Button>
            )}
          </div>
          {snackBar && <div className="contactSalesText">Thank you for your interest. We will be contacting you soon</div>}
        </div>
      )}
    </div>
  );
}
